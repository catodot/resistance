class TrumpHandEffectsController {
  /**
   * Create a new TrumpHandEffectsController
   * @param {Object} gameState - The game state reference
   * @param {Object} audioManager - The audio manager reference
   */
  constructor(gameState, audioManager) {
    this.audioManager = audioManager;

    this.elements = {
      visual: document.getElementById("trump-hand-visual"),
      hitbox: document.getElementById("trump-hand-hitbox"),
      gameContainer: document.getElementById("game-container") || document.body,
    };

    this.gameState = gameState;
    this.promptShownTime = 0;

    // Use the global DeviceUtils for mobile detection
    this.isMobile = window.DeviceUtils ? window.DeviceUtils.isMobile() : false;

    // Constant state definitions
    this.STATES = {
      IDLE: "idle",
      HITTABLE: "hittable",
      HIT: "hit",
      GRAB_SUCCESS: "grab-success",
    };

    this._styleUpdatePending = false;

    // Current state tracking
    this.state = {
      current: this.STATES.IDLE,
      isAnimating: false,
      isHovering: false,
      isGrabbing: false,
      targetCountry: null,
    };

    // Configuration
    this.config = this._createConfiguration();

    // Store original z-index values for restoration
    this.originalZIndices = {
      visual: this.elements.visual ? window.getComputedStyle(this.elements.visual).zIndex : null,
      hitbox: this.elements.hitbox ? window.getComputedStyle(this.elements.hitbox).zIndex : null,
    };

    // Ensure visual has proper initial styles
    if (this.elements.visual) {
      // Don't inherit unwanted visibility
      this.elements.visual.style.visibility = "visible";
      // Set initial styles, including z-index 0
      this.elements.visual.style.zIndex = "2";
      this.resetVisual();
    }

    this.clickPromptElement = null;
  }

  _createConfiguration() {
    return {
      animationDuration: 650,
      promptDelay: 1500, // Delay before showing the prompt
      // CSS class names for state management
      defaultStateClass: "state-idle",
      hitStateClass: "hit", // Match existing CSS class
      hittableStateClass: "hittable", // Match existing CSS class
      grabSuccessStateClass: "grab-success", // Match existing CSS class
      firstBlockModifier: "first-block",
      grabbingModifier: "grabbing",
      hoverModifier: "hover-active",
      animationCompletedModifier: "animation-completed",
    };
  }

  _addFlagToCountry(country) {
    // For Canada, handle east/west special case
    const targetCountry = country === "eastCanada" || country === "westCanada" ? "canada" : country;
    const countryState = this.gameState.countries[targetCountry];

    const isFullyAnnexed = countryState.claims + 1 >= countryState.maxClaims;
    if (!isFullyAnnexed || (countryState.flags && countryState.flags.length > 0)) {
      return;
    }

    // Positions match actual map layout
    let position;

    if (country === "eastCanada") {
      // East Canada is further right (higher X)
      position = { x: 2000, y: 1550, scale: 0.7 }; // Eastern Quebec
    } else if (country === "westCanada") {
      // West Canada is further left (lower X)
      position = { x: 650, y: 1200, scale: 0.7 }; // Alberta
    } else {
      // Otherwise use country's first flag position
      position = countryState.flagPositions?.[0];
    }

    if (!position) {
      console.warn(`No flag position available for ${country}`);
      return;
    }

    // Scale position based on current map scale
    const mapElement = document.getElementById("map-background");
    if (mapElement) {
      const mapScale = mapElement.clientWidth / mapElement.naturalWidth;
      const scaledPosition = {
        x: position.x * mapScale,
        y: position.y * mapScale,
        scale: position.scale * mapScale,
      };

      // Add map offset
      const mapRect = mapElement.getBoundingClientRect();
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        const containerRect = gameContainer.getBoundingClientRect();
        scaledPosition.x += mapRect.left - containerRect.left;
        scaledPosition.y += mapRect.top - containerRect.top;
      }

      // Create the flag animation
      const flagInfo = window.animationManager.createFlagAnimation(`${targetCountry}-flag`, scaledPosition, scaledPosition.scale);

      // Store reference to the flag
      if (flagInfo) {
        if (!countryState.flags) {
          countryState.flags = [];
        }

        countryState.flags.push(flagInfo);
      }
    }
  }

  setVisualZIndex(zIndex) {
    if (this.elements.visual) {
      this.elements.visual.style.zIndex = zIndex;
    }
  }

  updateVisualStyles() {
    if (!this.elements.visual) return;

    // Throttle rapid successive updates
    if (this._styleUpdatePending) return;

    this._styleUpdatePending = true;

    requestAnimationFrame(() => {
      // Remember current z-index to preserve it
      const currentZIndex = this.elements.visual.style.zIndex;

      // Clear all state classes first
      this.elements.visual.classList.remove(
        "state-idle",
        "state-hittable",
        "hittable",
        "hit",
        "grab-success",
        "first-block",
        "grabbing",
        "hover-active",
        "animation-completed"
      );

      if (this.state.current === this.STATES.IDLE) {
        // Don't add any classes for idle
      } else if (this.state.current === this.STATES.HITTABLE) {
        this.elements.visual.classList.add("hittable");
      } else if (this.state.current === this.STATES.HIT) {
        this.elements.visual.classList.add("hit");
      } else if (this.state.current === this.STATES.GRAB_SUCCESS) {
        this.elements.visual.classList.add("grab-success");
      }

      // Add modifiers based on state
      if (this.isFirstBlock() && this.state.current === this.STATES.HITTABLE) {
        this.elements.visual.classList.add("first-block");
      }

      if (this.state.isGrabbing && this.state.current === this.STATES.HITTABLE) {
        this.elements.visual.classList.add("grabbing");
      }

      if (this.state.isHovering) {
        this.elements.visual.classList.add("hover-active");
      }

      // Ensure the visual doesn't interfere with clicks
      this.elements.visual.style.pointerEvents = "none";

      // Restore the z-index we saved earlier
      this.elements.visual.style.zIndex = currentZIndex;

      // Ensure the hitbox remains interactive
      if (this.elements.hitbox) {
        this.elements.hitbox.style.pointerEvents = "all";
        this.elements.hitbox.style.cursor = "pointer";
        this.elements.hitbox.style.zIndex = "1";
      }

      // Reset flag after update
      this._styleUpdatePending = false;
    });
  }

  setStyles(element, styles) {
    if (!element) return;

    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
  }

  resetVisual() {
    if (!this.elements.visual) return;

    // Remove all state and effect classes
    this.elements.visual.classList.remove(
      "state-idle",
      "state-hittable",
      "hittable",
      "hit",
      "grab-success",
      "first-block",
      "grabbing",
      "hover-active",
      "animation-completed"
    );


    // Remove any dynamic shard elements
    this.removeShards();

    // Reset state
    this.state.isAnimating = false;
    this.state.isHovering = false;
    this.state.isGrabbing = false;
    this.state.targetCountry = null;
    this.state.current = this.STATES.IDLE;

    // logger.debug("effects", "Visual reset to default state");
  }

  isFirstBlock() {
    return this.gameState?.stats?.successfulBlocks === 0;
  }

  _scheduleHitEffectCleanup() {
    setTimeout(() => {
      // Remove screen shake
      this.elements.gameContainer.classList.remove("screen-shake");

      // Add animation completed class
      this.elements.visual.classList.add(this.config.animationCompletedModifier);

      // Complete reset after a short delay
      setTimeout(() => {
        this.resetVisual();
      }, 100);
    }, this.config.animationDuration);
  }

  _scheduleGrabEffectCleanup() {
    setTimeout(() => {
      // Remove screen shake
      this.elements.gameContainer.classList.remove("grab-screen-shake");

      // Add animation completed class
      this.elements.visual.classList.add(this.config.animationCompletedModifier);

      // Complete reset after a short delay
      setTimeout(() => {
        this.resetVisual();
      }, 100);
    }, this.config.animationDuration);
  }

  makeHittable(isFirstBlock = this.isFirstBlock()) {
    if (!this.elements.visual || !this.elements.hitbox) {
      console.error("Cannot make hittable: visual or hitbox element is missing");
      return;
    }

    // Update classes on the hitbox
    this.elements.hitbox.classList.add("hittable");

    // Clear all state classes on the visual
    this.elements.visual.classList.remove("state-idle", "hit", "grab-success", "animation-completed");

    // IMPORTANT: always show visual on grabs
    this.elements.visual.style.display = "block";

    // Add hittable class to visual
    this.elements.visual.classList.add("hittable");

    if (isFirstBlock) {
      this.elements.visual.style.opacity = "0.8";
      this.elements.visual.classList.add("first-block");
    } else if (this.state.isGrabbing) {
      this.elements.visual.classList.add("grabbing");
    } else {
      // Actual path for non-first hittable state
      this.elements.visual.style.opacity = "0.9";
      // this.elements.visual.style.zIndex = "2";

      this.elements.visual.classList.add("grabbing");
    }

    // Make hitbox interactive
    this.elements.hitbox.style.pointerEvents = "all";
    this.elements.hitbox.style.cursor = "pointer";
    // this.elements.hitbox.style.zIndex = "1";

    // Make visual non-interactive
    this.elements.visual.style.pointerEvents = "none";

    // Update state
    this.state.isAnimating = false;
    this.state.current = this.STATES.HITTABLE;

    this.updatePromptVisibility();
  }

  applyHitEffect() {
    if (!this.elements.visual) return;

    // Stop if already animating this effect
    if (this.state.isAnimating && this.state.current === this.STATES.HIT) return;

    // Update state
    this.state.isAnimating = true;
    this.state.current = this.STATES.HIT;
    this.state.isHovering = false;
    this.state.isGrabbing = false; // Not grabbing anymore after being hit

    // First ensure the visual element is visible
    this.elements.visual.style.display = "block";
    this.elements.visual.style.opacity = "1";

    // Remove existing classes
    this.elements.visual.classList.remove("state-hittable", "hittable", "grab-success", "first-block", "grabbing", "hover-active");

    // Ensure pointer events are disabled
    this.elements.visual.style.pointerEvents = "none";

    // Apply screen shake
    this.elements.gameContainer.classList.add("screen-shake");

    // Deferred to restart animation cheaply
    requestAnimationFrame(() => {
      this.elements.visual.classList.add("hit");
    });

    // Clean up after animation
    this._scheduleHitEffectCleanup();
  }

  applyGrabSuccessEffect(targetCountry) {
    if (!this.elements.visual) return;

    // Stop if already animating this effect
    if (this.state.isAnimating && this.state.current === this.STATES.GRAB_SUCCESS) return;

    // Update state
    this.state.isAnimating = true;
    this.state.current = this.STATES.GRAB_SUCCESS;
    this.state.isHovering = false;
    this.state.isGrabbing = false; // Grab is complete, not grabbing anymore

    // Remove existing classes
    this.elements.visual.classList.remove("state-hittable", "hittable", "hit", "first-block", "grabbing", "hover-active");

    // Ensure pointer events are disabled
    this.elements.visual.style.pointerEvents = "none";

    // Create shard elements
    this.createShards();

    if (!window.gameEngine?.systems?.state?.gameEnding) {
      this.elements.gameContainer.classList.add("grab-screen-shake");
    }

    this.showDangerFlash(targetCountry);

    // Deferred to restart animation cheaply
    requestAnimationFrame(() => {
      this.elements.visual.classList.add("grab-success");
    });

    // Add Trump flag to the country
    if (targetCountry) {
      this._addFlagToCountry(targetCountry);
    } else {
      console.log("yyy no target country");
    }

    // Clean up after animation
    this._scheduleGrabEffectCleanup();

    if (window.handHitboxManager) {
      window.handHitboxManager.hideHandHitbox();
    }
  }

  showDangerFlash(targetCountry) {
    console.log("showDangerFlash called with targetCountry:", targetCountry);

    // Normalize the country ID for Canada regions
    const countryToFlash = targetCountry === "eastCanada" || targetCountry === "westCanada" ? "canada" : targetCountry;

    // Get the flag overlay element
    const flagOverlay = document.getElementById(`${countryToFlash}-flag-overlay`);

    if (!flagOverlay) {
      console.warn(`[DangerFlash] Flag overlay not found for ${countryToFlash}`);
      return;
    }

    // Add danger flash class if missing
    if (!document.getElementById("danger-flash-styles")) {
      const style = document.createElement("style");
      style.id = "danger-flash-styles";
      style.textContent = `
        .danger-flash {
          animation: dangerFlashAnimation 0.8s ease-out !important;
        }
        
        @keyframes dangerFlashAnimation {
          0% {
            filter: brightness(1) sepia(0) saturate(1) hue-rotate(0deg);
            opacity: 0;
            transform: scale(1);
          }
          15% {
            filter: brightness(2) sepia(1) saturate(8) hue-rotate(-15deg);
            opacity: 1;
            transform: scale(1.05);
          }
          30% {
            filter: brightness(1.8) sepia(0.9) saturate(6) hue-rotate(-10deg);
            opacity: 0.9;
            transform: scale(1.02);
          }
          45% {
            filter: brightness(2.2) sepia(1) saturate(8) hue-rotate(-15deg);
            opacity: 1;
            transform: scale(1.06);
          }
          60% {
            filter: brightness(1.6) sepia(0.8) saturate(5) hue-rotate(-8deg);
            opacity: 0.8;
            transform: scale(1.01);
          }
          80% {
            filter: brightness(1.4) sepia(0.6) saturate(3) hue-rotate(-5deg);
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            filter: brightness(1) sepia(0) saturate(1) hue-rotate(0deg);
            opacity: 0;
            transform: scale(1);
          }
        }
        
        .danger-flash-intense {
          animation: dangerFlashIntenseAnimation 1.2s ease-out !important;
        }
        
        @keyframes dangerFlashIntenseAnimation {
          0% {
            filter: brightness(1) sepia(0) saturate(1) hue-rotate(0deg);
            opacity: 0;
            transform: scale(1);
          }
          10% {
            filter: brightness(3) sepia(1) saturate(10) hue-rotate(-20deg);
            opacity: 1;
            transform: scale(1.1);
          }
          20% {
            filter: brightness(2) sepia(0.8) saturate(6) hue-rotate(-10deg);
            opacity: 0.7;
            transform: scale(1.05);
          }
          35% {
            filter: brightness(3.5) sepia(1) saturate(12) hue-rotate(-25deg);
            opacity: 1;
            transform: scale(1.15);
          }
          50% {
            filter: brightness(2.5) sepia(0.9) saturate(8) hue-rotate(-15deg);
            opacity: 0.9;
            transform: scale(1.08);
          }
          65% {
            filter: brightness(2) sepia(0.7) saturate(5) hue-rotate(-10deg);
            opacity: 0.8;
            transform: scale(1.04);
          }
          80% {
            filter: brightness(1.5) sepia(0.5) saturate(3) hue-rotate(-5deg);
            opacity: 0.6;
            transform: scale(1.02);
          }
          100% {
            filter: brightness(1) sepia(0) saturate(1) hue-rotate(0deg);
            opacity: 0;
            transform: scale(1);
          }
        }
        
        /* White-hot flash overlay */
        .danger-flash-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #ff0000;
          mix-blend-mode: color-dodge;
          pointer-events: none;
          z-index: 9999;
          animation: screenFlashAnimation 0.3s ease-out;
        }
        
        @keyframes screenFlashAnimation {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
          }
        }
        
        /* Danger vignette effect */
        .danger-vignette {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9998;
          background: radial-gradient(circle at center, transparent 40%, rgba(255, 0, 0, 0.4) 100%);
          animation: vignetteAnimation 1s ease-out;
        }
        
        @keyframes vignetteAnimation {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Store original opacity and classes
    const originalOpacity = flagOverlay.style.opacity;
    const originalClasses = flagOverlay.className;

    // Determine if this is the final claim
    const countryState = this.gameState.countries[countryToFlash];
    const isFinalClaim = countryState && countryState.claims >= countryState.maxClaims;

    // Create screen-wide flash effect
    const flashOverlay = document.createElement("div");
    flashOverlay.className = "danger-flash-overlay";
    document.body.appendChild(flashOverlay);

    // Create danger vignette
    if (isFinalClaim) {
      const vignette = document.createElement("div");
      vignette.className = "danger-vignette";
      document.body.appendChild(vignette);

      // Remove vignette after animation
      setTimeout(() => {
        if (vignette.parentNode) {
          vignette.parentNode.removeChild(vignette);
        }
      }, 1000);
    }

    // Remove flash overlay after animation
    setTimeout(() => {
      if (flashOverlay.parentNode) {
        flashOverlay.parentNode.removeChild(flashOverlay);
      }
    }, 300);

    flagOverlay.classList.remove("danger-flash", "danger-flash-intense");

    // Deferred to restart animation cheaply
    requestAnimationFrame(() => {
      if (isFinalClaim) {
        flagOverlay.classList.add("danger-flash-intense");
      } else {
        flagOverlay.classList.add("danger-flash");
      }
    });

    if (isFinalClaim) {
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        gameContainer.classList.add("heavy-screen-shake");
        setTimeout(() => {
          gameContainer.classList.remove("heavy-screen-shake");
        }, 1000);
      }
    } else {
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        gameContainer.classList.add("screen-shake");
        setTimeout(() => {
          gameContainer.classList.remove("screen-shake");
        }, 500);
      }
    }

    // Remove classes after animation
    setTimeout(
      () => {
        flagOverlay.classList.remove("danger-flash", "danger-flash-intense");
      },
      isFinalClaim ? 1200 : 800
    );

    // Pulsing red border effect
    if (isFinalClaim) {
      const originalBorder = flagOverlay.style.border;
      flagOverlay.style.border = "5px solid rgba(255, 0, 0, 0.9)";
      flagOverlay.style.boxShadow = "0 0 20px rgba(255, 0, 0, 0.8)";
      flagOverlay.style.transition = "border 0.3s ease-out, box-shadow 0.3s ease-out";

      setTimeout(() => {
        flagOverlay.style.border = originalBorder || "";
        flagOverlay.style.boxShadow = "";
      }, 1000);
    }
  }

  /**
   * Create shard elements for grab success effect
   */
  createShards() {
    if (!this.elements.visual) return;

    // Remove existing shards first
    this.removeShards();

    // Create new shards
    for (let i = 3; i <= 8; i++) {
      const shard = document.createElement("div");
      shard.className = `shard${i}`;
      shard.setAttribute("data-shard-id", i.toString());

      // Keep shards visible, non-blocking to clicks
      this.setStyles(shard, {
        position: "absolute",
        opacity: "1",
        top: "50%",
        left: "50%",
        visibility: "visible",
        pointerEvents: "none", // Ensure shards don't block clicks
      });

      this.elements.visual.appendChild(shard);
    }
  }

  /**
   * Remove shard elements
   */
  removeShards() {
    if (!this.elements.visual) return;

    const shards = this.elements.visual.querySelectorAll("[data-shard-id]");
    shards.forEach((shard) => shard.remove());
  }

  highlightTargetCountry(country, isTargeting) {
    if (!country) return;

    // Get the flag overlay element
    const flagOverlay = document.getElementById(`${country}-flag-overlay`);
    if (!flagOverlay) return;

    if (isTargeting) {
      // Store current opacity for restoration
      flagOverlay._previousOpacity = flagOverlay.style.opacity || "0";

      // Add highlight class
      flagOverlay.classList.add("targeting-pulse");

      const currentOpacity = parseFloat(flagOverlay._previousOpacity);
      // Darken slightly (+5% opacity)
      const threatOpacity = Math.min(0.95, currentOpacity + 0.05).toString();
      flagOverlay.style.opacity = threatOpacity;

      // Store the currently targeted country
      this.state.targetCountry = country;
    } else {
      // Remove highlight
      flagOverlay.classList.remove("targeting-pulse");

      // Restore previous opacity
      if (flagOverlay._previousOpacity !== undefined) {
        flagOverlay.style.opacity = flagOverlay._previousOpacity;
        delete flagOverlay._previousOpacity;
      }

      // Clear the targeted country if it matches
      if (this.state.targetCountry === country) {
        this.state.targetCountry = null;
      }
    }
  }

  updateHoverState(isHovering) {
    if (!this.elements.visual || !this.elements.hitbox) return;

    // Update hover state tracking
    this.state.isHovering = isHovering;

    // Prevent hover effects during animations
    if (this.state.isAnimating) return;

    // Only apply hover when hittable
    if (this.elements.hitbox.classList.contains(this.STATES.HITTABLE)) {
      // Update visual based on current state configuration
      this.updateVisualStyles();

      logger.debug("effects", isHovering ? "Applied hover styles" : "Removed hover styles", {
        isGrabbing: this.state.isGrabbing,
        isFirstBlock: this.isFirstBlock(),
      });
    }
  }

  setGrabbingState() {
    if (!this.elements.visual) return;

    // Only update if the state is changing
    if (!this.state.isGrabbing) {
      // Update grabbing state
      this.state.isGrabbing = true;

      // If we're in hittable state, update styling
      if (this.state.current === this.STATES.HITTABLE) {
        this.updateVisualStyles();
      }

      logger.debug("effects", "Set to grabbing state");
    }
  }

  /**
   * Set not-grabbing state
   */
  setNotGrabbingState() {
    console.log("set not grabbing state");

    if (!this.elements.visual) return;

    // Only update if the state is changing
    if (this.state.isGrabbing) {
      // Update grabbing state
      this.state.isGrabbing = false;

      if (this.state.current === this.STATES.HITTABLE) {
        this.updateVisualStyles();
      } else {
        // Reset to default state
        this.resetVisual();
      }

      logger.debug("effects", "Set to not-grabbing state");
    }
  }

  /**
   * PUBLIC API METHODS
   */

  addClickHerePrompt() {
    // Remove any existing prompt first
    this.removeClickHerePrompt();

    const isMobile = window.DeviceUtils ? window.DeviceUtils.isMobile() : false;

    // Create the prompt element
    this.clickPromptElement = document.createElement("div");
    this.clickPromptElement.id = "trump-hand-click-prompt";
    this.clickPromptElement.textContent = isMobile ? "TAP HERE" : "CLICK HERE";

    // Add base classes
    this.clickPromptElement.classList.add(
      "hand-click-prompt",
      isMobile ? "hand-click-prompt--mobile" : "hand-click-prompt--desktop",
      "hand-click-prompt--pulsing"
    );

    // Styling
    // this.clickPromptElement.style.zIndex = "2";
    this.clickPromptElement.style.pointerEvents = "none";

    // Add prompt styles if not already present
    if (!document.getElementById("hand-prompt-style")) {
      this.addPromptStyles();
    }

    // Append to visual element
    if (this.elements.visual) {
      this.elements.visual.appendChild(this.clickPromptElement);
    }
  }

  removeClickHerePrompt() {
    // Remove trump-hand-click-prompt
    const existingPrompt = document.getElementById("trump-hand-click-prompt");
    if (existingPrompt && existingPrompt.parentNode) {
      existingPrompt.parentNode.removeChild(existingPrompt);
    }

    // Remove any .hitbox-prompt elements
    if (this.elements.hitbox) {
      const hitboxPrompts = this.elements.hitbox.querySelectorAll(".hitbox-prompt");
      hitboxPrompts.forEach((prompt) => prompt.remove());
    }

    // Remove style elements
    const handPromptStyle = document.getElementById("hand-prompt-style");
    if (handPromptStyle) handPromptStyle.remove();

    const hitboxPromptStyle = document.getElementById("hitbox-prompt-style");
    if (hitboxPromptStyle) hitboxPromptStyle.remove();

    // Clear reference
    this.clickPromptElement = null;
  }

  addPromptStyles() {
    const style = document.createElement("style");
    style.id = "hand-prompt-style";
    style.textContent = `
      
    `;
    document.head.appendChild(style);
  }

  removeClickHerePrompt() {
    // Minimal fallback if no effects controller
    const prompt = document.getElementById("trump-hand-click-prompt");
    if (prompt && prompt.parentNode) {
      prompt.parentNode.removeChild(prompt);
    }
  }

  updatePromptVisibility() {
    // Verify gameState is available
    if (!this.gameState) {
      console.warn("Game state not available for prompt visibility check");
      return;
    }

    const isBeforeFirstBlock =
      this.gameState &&
      this.gameState.stats &&
      typeof this.gameState.stats.successfulBlocks === "number" &&
      this.gameState.stats.successfulBlocks === 0;

    // Seconds elapsed since game start
    const currentGameTime = this.gameState.config ? this.gameState.config.GAME_DURATION - this.gameState.timeRemaining : 0;

    // Show prompt after 3s of game time
    const shouldShowPrompt = isBeforeFirstBlock && this.state.current === this.STATES.HITTABLE && currentGameTime >= 3;

    if (shouldShowPrompt) {
      // Set higher z-index when showing the prompt
      this.setVisualZIndex("10");
      this.addClickHerePrompt();
    } else {
      this.setVisualZIndex("1");
      this.removeClickHerePrompt();
    }
  }
  handleSuccessfulHit() {
    console.log("successful hit");

    // Remove click-here prompt after hit
    this.removeClickHerePrompt();

    // Reset z-index after first hit
    // this.setVisualZIndex("1");

    this.updateVisualStyles();
  }

  reset() {
    // Reset visual elements
    this.resetVisual();

    // Remove any prompts
    this.removeClickHerePrompt();

    // Reset prompt shown state
    this.promptShownTime = 0;

    // Reset state
    this.state = {
      current: this.STATES.IDLE,
      isAnimating: false,
      isHovering: false,
      isGrabbing: false,
      targetCountry: null,
    };

    // Make non-hittable
    if (this.elements.hitbox) {
      this.elements.hitbox.classList.remove(this.STATES.HITTABLE);
      this.elements.hitbox.style.pointerEvents = "none";
    }
    // Remove any animation elements
    this.removeShards();

    // Remove classes from gameContainer
    if (this.elements.gameContainer) {
      this.elements.gameContainer.classList.remove("screen-shake", "grab-screen-shake");
    }

    logger.debug("effects", "Reset Trump hand effects controller");
  }
}
