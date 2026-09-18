
class HandHitboxManager {
  /**
   * Create a new HandHitboxManager
   * @param {Object} audioManager - The audio manager reference
   */
  constructor(audioManager) {
    this.audioManager = audioManager;

    // Configuration
    this.config = {
      VISUAL_SCALE_FACTOR: 0.55,
      MOBILE_TOUCH_FACTOR: 1.2,
      DESKTOP_TOUCH_FACTOR: 1.0,
      REFERENCE_SCALE: 1.0,
    };

    // DOM elements, kept as direct references
    this.trumpHandHitBox = document.getElementById("trump-hand-hitbox");
    this.trumpHandHitBoxVisual = document.getElementById("trump-hand-visual");

    // Also store in elements object for consistency
    this.elements = {
      hitbox: this.trumpHandHitBox,
      visual: this.trumpHandHitBoxVisual,
    };

    // Animation state
    this.currentState = "";
    this.currentFrame = 0;
    this.isVisible = false;
    this.isDebugMode = false;

    // Event handlers
    this._hoverHandlers = null;

    // Animation data reference
    this.animations = null;

    // Allowed animation states
    this.animationTypes = {
      grab: [
        "grabEastCanada",
        "grabEastCanadaSmall",
        "grabEastCanadaSmaller",
        "grabEastCanadaSmallest",
        "grabWestCanada",
        "grabWestCanadaSmall",
        "grabWestCanadaSmaller",
        "grabWestCanadaSmallest",
        "grabMexico",
        "grabMexicoSmall",
        "grabMexicoSmaller",
        "grabMexicoSmallest",
        "grabGreenland",
        "grabGreenlandSmall",
        "grabGreenlandSmaller",
        "grabGreenlandSmallest",
      ],
      smack: ["slapped"],
    };

    this.init();
  }

  /**
   * Initialize the hitbox manager
   */
  init() {
    if (this.trumpHandHitBox) {
      this.trumpHandHitBox.style.display = "none";
      this.trumpHandHitBox.style.pointerEvents = "none";

      if (!window.trumpHandEffects) {
        this.setupHoverEffects();
      }
    } else {
    }

    // Clear any existing tracking interval
    if (window.handVisualInterval) {
      clearInterval(window.handVisualInterval);
      window.handVisualInterval = null;
    }
  }

  /**
   * Hide the hitbox
   */
  hideHandHitbox() {
    if (this.trumpHandHitBox) {
      this.trumpHandHitBox.style.display = "none";
      this.trumpHandHitBox.style.pointerEvents = "none";
      this.isVisible = false;

      // If TrumpHandEffectsController exists, use its method
      if (window.trumpHandEffects) {
        window.trumpHandEffects.removeClickHerePrompt();
      } else {
        // Fallback removal if no effects controller
        // this.removeClickHerePrompt();
      }
    }
  }

  /**
   * Setup hover effects for the hitbox
   */
  setupHoverEffects() {
    if (!this.trumpHandHitBox || !this.trumpHandHitBoxVisual) return;

    // Remove existing listeners first
    this.removeHoverEffects();

    // Define new handlers using the effects controller
    const onMouseEnter = () => {
      if (window.trumpHandEffects) {
        window.trumpHandEffects.updateHoverState(true);
      }

      // Add additional visual feedback by changing cursor
      this.trumpHandHitBox.style.cursor = "pointer";
    };

    const onMouseLeave = () => {
      if (window.trumpHandEffects) {
        window.trumpHandEffects.updateHoverState(false);
      }
    };

    // Add click sound effect
    const onClick = (e) => {
      // Prevent event bubbling
      e.stopPropagation();

    };

    // Add the event listeners
    this.trumpHandHitBox.addEventListener("mouseenter", onMouseEnter);
    this.trumpHandHitBox.addEventListener("mouseleave", onMouseLeave);
    this.trumpHandHitBox.addEventListener("click", onClick);

    // Store for later removal
    this._hoverHandlers = {
      enter: onMouseEnter,
      leave: onMouseLeave,
      click: onClick,
    };
  }

  /**
   * Remove hover effects
   */
  removeHoverEffects() {
    if (!this.trumpHandHitBox || !this._hoverHandlers) return;

    // Remove the stored event listeners
    if (this._hoverHandlers.enter) {
      this.trumpHandHitBox.removeEventListener("mouseenter", this._hoverHandlers.enter);
    }

    if (this._hoverHandlers.leave) {
      this.trumpHandHitBox.removeEventListener("mouseleave", this._hoverHandlers.leave);
    }

    if (this._hoverHandlers.click) {
      this.trumpHandHitBox.removeEventListener("click", this._hoverHandlers.click);
    }

    // Clear the stored handlers
    this._hoverHandlers = null;
  }

  /**
   * Set animations data
   * @param {Object} animations - Animations data object
   */
  setAnimationsData(animations) {
    this.animations = animations;
  }

  /**
   * Update current state and frame
   * @param {string} state - Current animation state
   * @param {number} frameIndex - Current frame index
   */
  updateStateAndFrame(state, frameIndex) {
    console.log("updating state and frame");

    this.currentState = state;
    this.currentFrame = frameIndex;
    this.updatePosition();
  }

  /**
   * Get coordinates for a specific animation frame
   * @param {Object} animation - The animation data
   * @param {number} frameIndex - The frame index to get coordinates for
   * @param {boolean} isMobile - Whether the device is mobile
   * @returns {Object|null} The scaled coordinates or null if not found
   */
  getCoordinatesForFrame(animation, frameIndex, isMobile) {
    // Check if coordinates exist for this frame
    if (!animation.handCoordinates || !animation.handCoordinates[frameIndex]) {
      return null;
    }

    const baseCoords = animation.handCoordinates[frameIndex];

    // Get the current map element
    const mapElem = document.getElementById("map-background");
    if (!mapElem) {
      return baseCoords; // Return unscaled as fallback
    }

    const currentMapScale = mapElem.clientWidth / mapElem.naturalWidth;

    // Scale desktop coordinates were calibrated at
    const referenceDesktopScale = this.config.REFERENCE_SCALE;

    // Calculate the adjustment needed
    const scaleAdjustment = currentMapScale / referenceDesktopScale;

    // Larger hitboxes on mobile for easier touch
    const touchFactor = isMobile ? this.config.MOBILE_TOUCH_FACTOR : this.config.DESKTOP_TOUCH_FACTOR;

    // Apply scaling
    const scaledCoords = {
      x: Math.round(baseCoords.x * scaleAdjustment),
      y: Math.round(baseCoords.y * scaleAdjustment),
      width: Math.round(baseCoords.width * scaleAdjustment * touchFactor),
      height: Math.round(baseCoords.height * scaleAdjustment * touchFactor),
    };

    return scaledCoords;
  }

  /**
   * @param {boolean} predictFrame - Whether to predict next frame position for smoother animations
   */
  updatePosition(predictFrame = false) {
    // Validate required elements and data
    if (!this.trumpHandHitBox) {
      return;
    }

    if (!this.animations) {
      return;
    }

    const grabAnimations = this.animationTypes.grab;
    const smackedAnimations = this.animationTypes.smack;
    this.isDebugMode = document.body.classList.contains("debug-mode");

    if (this.currentState === "idle" || smackedAnimations.includes(this.currentState)) {
      if (!window.trumpHandEffects?.state.isAnimating) {
        this.hideHandHitbox();

        // Also hide visual if not animating
        if (this.trumpHandHitBoxVisual) {
          // this.trumpHandHitBoxVisual.style.opacity = "0";
        }
      }
      return;
    }

    // Only continue for grab animations
    if (!grabAnimations.includes(this.currentState)) {
      this.hideHandHitbox();
      return;
    }

    const animation = this.animations[this.currentState];
    if (!animation || !animation.handCoordinates) {
      this.hideHandHitbox();
      return;
    }

    const isMobile = window.DeviceUtils ? window.DeviceUtils.isMobile() : false;

    // Look ahead a frame if predicting
    let frameToUse = this.currentFrame;
    if (predictFrame && frameToUse < animation.handCoordinates.length - 2) {
      frameToUse += 2;
    }

    // Get the coordinates for the specified frame
    let coords = this.getCoordinatesForFrame(animation, frameToUse, isMobile);

    if (!coords) {
      this.hideHandHitbox();
      return;
    }

    // Position the hitbox
    this.positionHitbox(coords, isMobile);
  }

  /**
   * Position the hitbox at specified coordinates
   * @param {Object} coords - Coordinates for positioning
   * @param {boolean} isMobile - True if on mobile device
   */
  positionHitbox(coords, isMobile) {
    // Position the hitbox
    this.trumpHandHitBox.style.position = "absolute";
    this.trumpHandHitBox.style.left = `${coords.x}px`;
    this.trumpHandHitBox.style.top = `${coords.y}px`;
    this.trumpHandHitBox.style.width = `${coords.width}px`;
    this.trumpHandHitBox.style.height = `${coords.height}px`;

    // Make visible and clickable
    this.trumpHandHitBox.style.display = "block";
    this.trumpHandHitBox.style.pointerEvents = "all";
    this.trumpHandHitBox.style.cursor = "pointer"; // Add cursor pointer
    this.trumpHandHitBox.style.zIndex = "300"; // Ensure it's above visual elements
    this.isVisible = true;

    // Position visual, adjusting for coordinate space
    if (this.trumpHandHitBoxVisual) {
      // Sprite container's position relative to parent
      const trumpContainer = document.getElementById("trump-sprite-container");
      const containerRect = trumpContainer ? trumpContainer.getBoundingClientRect() : { left: 0, top: 0 };
      const parentRect = trumpContainer && trumpContainer.parentElement ? trumpContainer.parentElement.getBoundingClientRect() : { left: 0, top: 0 };

      // Offset from sprite container to parent
      const offsetX = containerRect.left - parentRect.left;
      const offsetY = containerRect.top - parentRect.top;

      // Size, adjusted for coordinate system difference
      const scaledWidth = coords.width * this.config.VISUAL_SCALE_FACTOR;
      const scaledHeight = coords.height * this.config.VISUAL_SCALE_FACTOR;
      const adjustedX = coords.x + offsetX + (coords.width - scaledWidth) / 2;
      const adjustedY = coords.y + offsetY + (coords.height - scaledHeight) / 2;

      this.trumpHandHitBoxVisual.style.position = "absolute";
      this.trumpHandHitBoxVisual.style.left = `${adjustedX}px`;
      this.trumpHandHitBoxVisual.style.top = `${adjustedY}px`;
      this.trumpHandHitBoxVisual.style.width = `${scaledWidth}px`;
      this.trumpHandHitBoxVisual.style.height = `${scaledHeight}px`;
      this.trumpHandHitBoxVisual.style.pointerEvents = "none"; // Ensure visual doesn't block clicks

      if (this.trumpHandHitBoxVisual) {
        // Try to restore styling via effects controller
        if (window.trumpHandEffects && this.trumpHandHitBox.classList.contains("hittable")) {
          try {
            if (typeof window.trumpHandEffects.updateVisualStyles === "function") {
              window.trumpHandEffects.updateVisualStyles();
            }
          } catch (e) {
            console.warn("Error restoring visual state:", e);
          }
        } else if (!this.trumpHandHitBoxVisual.classList.contains("hit") && !this.trumpHandHitBoxVisual.classList.contains("grab-success")) {
          // Only basic visibility if no effects controller
          this.trumpHandHitBoxVisual.style.display = "block";
          this.trumpHandHitBoxVisual.style.visibility = "visible";
        }
      }
    }

    // Ensure hover effects are attached
    if (!this._hoverHandlers) {
      this.setupHoverEffects();
    }

    // Show prompt via effects controller if needed
    const isBeforeFirstBlock =
      window.gameManager &&
      window.gameManager.gameState &&
      window.gameManager.gameState.stats &&
      window.gameManager.gameState.stats.successfulBlocks === 0;

    if (isBeforeFirstBlock && window.trumpHandEffects) {
      window.trumpHandEffects.updatePromptVisibility();
    }
  }

  handleSuccessfulHit() {
    // Delegate prompt removal to effects controller
    if (window.trumpHandEffects) {
      window.trumpHandEffects.handleSuccessfulHit();
    }
  }

  /**
   * Reset the hitbox state
   */
  reset() {
    // Reset any hitbox state as needed

    this.trumpHandHitBox = document.getElementById("trump-hand-hitbox");

    // Reset any flags or state
    if (this.trumpHandHitBox) {
      this.trumpHandHitBox.classList.remove("hittable", "first-block-help", "hit");
      this.trumpHandHitBox.style.visibility = "hidden";
      this.trumpHandHitBox.style.pointerEvents = "none";
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    this.removeHoverEffects();

    // Remove prompt via effects controller if available
    if (window.trumpHandEffects) {
      window.trumpHandEffects.removeClickHerePrompt();
    }

    // Hide hitbox
    this.hideHandHitbox();

    // Clear references
    this.trumpHandHitBox = null;
    this.trumpHandHitBoxVisual = null;
    this.elements.hitbox = null;
    this.elements.visual = null;
  }

  /**
   * Set debug mode
   * @param {boolean} enabled - Whether debug mode is enabled
   */
  setDebugMode(enabled) {
    this.isDebugMode = enabled;

    if (this.isVisible) {
      this.updatePosition(); // Update visual style
    }

    // Apply debug visuals if needed
    if (this.trumpHandHitBox) {
      if (enabled) {
      } else {
        this.trumpHandHitBox.style.border = "none";
        this.trumpHandHitBox.style.backgroundColor = "transparent";
      }
    }
  }

  /**
   * Get current hitbox information
   * @returns {Object|null} Hitbox information or null if not visible
   */
  getHitboxInfo() {
    if (!this.trumpHandHitBox || !this.isVisible) {
      return null;
    }

    return {
      x: parseInt(this.trumpHandHitBox.style.left, 10),
      y: parseInt(this.trumpHandHitBox.style.top, 10),
      width: parseInt(this.trumpHandHitBox.style.width, 10),
      height: parseInt(this.trumpHandHitBox.style.height, 10),
      visible: this.isVisible,
      state: this.currentState,
      frame: this.currentFrame,
    };
  }
}
