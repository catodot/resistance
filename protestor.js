// Define the Protestor class to encapsulate behavior

class Protestor {
  constructor(countryId, hitbox, gameContainer, config, callbacks) {
    this.countryId = countryId;
    this.hitbox = hitbox;
    this.gameContainer = gameContainer;
    this.config = config;
    this.callbacks = callbacks;
    this.element = null;
    this.wrapper = null;
    this.disappearTimeout = null;
    this.shrinkTimeout = null;
    this.animations = {};
    this.currentScale = 1.0;
    // Blocks premature per-frame cleanup during click animation
    this.isDismissing = false;
    this.isMobile = this._isMobile();
    this.zIndexes = this.config.Z_INDEXES;
  }

  // Check for mobile device
  _isMobile() {
    return window.DeviceUtils && window.DeviceUtils.isMobile();
  }

  // Create the protestor elements
  create() {
    // Clean up any existing elements
    this.cleanup();

    const { left, top, width, height } = this._getHitboxDimensions();

    // Create wrapper with glow
    this.wrapper = this._createWrapper(left, top, width, height);

    // Create protestors sprite
    const protestors = document.createElement("div");
    protestors.id = `${this.countryId}-protestors`;
    Object.assign(protestors.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      backgroundImage: "url('images/protest.png')",
      backgroundSize: "400% 100%", // For 4-frame sprite sheet
      backgroundPosition: "0% 0%",
      backgroundRepeat: "no-repeat",
      opacity: "0",
      transition: "opacity 0.3s ease-out",
      zIndex: "2",
    });
    this.wrapper.appendChild(protestors);
    this.element = protestors;

    this.gameContainer.appendChild(this.wrapper);

    // Start animations
    this._setupAnimations();

    // Set disappear timeout
    this._setDisappearTimeout();

    return this.wrapper;
  }

  // Get hitbox dimensions
  _getHitboxDimensions() {
    return {
      left: parseInt(this.hitbox.style.left) || 0,
      top: parseInt(this.hitbox.style.top) || 0,
      width: parseInt(this.hitbox.style.width) || 100,
      height: parseInt(this.hitbox.style.height) || 100,
    };
  }

  // Re-sync sprite with hitbox, e.g. on resize
  reposition() {
    if (!this.wrapper) return;
    const { left, top, width, height } = this._getHitboxDimensions();
    Object.assign(this.wrapper.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  // Create wrapper with glow
  _createWrapper(left, top, width, height) {
    const glowOutline = new GlowOutline();
    const wrapper = glowOutline.create({
      parentId: this.countryId,
      position: { left, top },
      size: { width, height },
      color: "#FFD700", // Gold color
      zIndex: 10,
    });
    wrapper.id = `${this.countryId}-protestors-wrapper`;
    // wrapper.classList.add("protestor-underglow");
    return wrapper;
  }

  // Set up protestor animations
  _setupAnimations() {
    // Get the outline element
    const outline = document.getElementById(`${this.countryId}-protestors-outline`);

    if (this.element) {
      // Track sprite transition separately
      this.element.addEventListener(
        "transitionend",
        () => {
          console.debug(`Protestor sprite for ${this.countryId} visible`);
        },
        { once: true }
      );

      // Use animation manager for sprite animation
      if (window.animationManager && !window.DEBUG_DISABLE?.protestorSpriteAnim) {
        const animationId = window.animationManager.createSpriteAnimation({
          element: this.element,
          frameCount: 4,
          frameDuration: this.isMobile ? 450 : 300, // Slower on mobile
          loop: true,
          id: `protestor-${this.countryId}`,
        });

        // Store the animation ID for cleanup
        this.animations.main = animationId;
      }
    }

    if (this.wrapper) {
      // Add grow-from-ground animation
      this.wrapper.style.transform = "scale(1, 0.2) translateY(10px)"; // Start small from ground

      // Fade in protestors after a short delay
      setTimeout(() => {
        if (this.wrapper) {
          // Now grow up with transition
          this.wrapper.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out";
          this.wrapper.style.transform = "scale(1, 1)"; // Grow to full size
        }

        if (this.element) {
          this.element.style.opacity = "1"; // Fade in the sprite
        }

        // Fade in the outline
        if (outline) {
          outline.style.transition = "opacity 0.5s ease-out";
          outline.style.opacity = "1";
        }
      }, 100);
    }
  }

  _setDisappearTimeout() {
    if (this.disappearTimeout) {
      clearTimeout(this.disappearTimeout);
    }
  
    // isFirstProtestors flag doubles the fade time
    const fadeTime = this.callbacks.isFirstProtestors ? 
      this.config.PROTESTOR_TIMING.FADE_AWAY_TIME * 2 : 
      this.config.PROTESTOR_TIMING.FADE_AWAY_TIME;
  
    this.disappearTimeout = setTimeout(() => {
      this.shrink();
    }, fadeTime);
  }

  // Handle click on protestor
  handleClick() {
    // Debounce clicks
    const now = Date.now();
    if (this.lastClickTime && now - this.lastClickTime < 100) {
      return;
    }
    this.lastClickTime = now;
    this.isDismissing = true;

    if (this.callbacks.onPlaySound) {
      this.callbacks.onPlaySound("growProtestors", 0.2);
    }

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate();
    }

    if (this.disappearTimeout) {
      clearTimeout(this.disappearTimeout);
    }

    this._processClick();

    if (this.callbacks.onSupportClick) {
      this.callbacks.onSupportClick(this.countryId);
    }

    setTimeout(() => this.shrink(), 350);
  }

  // Play the one-shot "supported" pop animation
  _processClick() {
    // Reset animation/transition for clean state
    this.wrapper.style.animation = "none";
    this.wrapper.style.transition = "none";

    // Store original position
    const originalPosition = {
      left: this.wrapper.style.left,
      top: this.wrapper.style.top,
      width: this.wrapper.style.width,
      height: this.wrapper.style.height,
    };

    this.wrapper.style.transformOrigin = "bottom center";

    // Deferred to restart transition cheaply
    requestAnimationFrame(() => {
      if (!this.wrapper) return;
      this.wrapper.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

      const scales = this.config.MOBILE_CONFIG.PROTESTOR_SCALE;
      this.element.style.backgroundImage = "url('images/protestHeart.png')";
      this.wrapper.style.transform = `scale(${scales.SUPPORT_CLICK})`;

      // Maintain position with efficient style updates
      Object.assign(this.wrapper.style, {
        position: "absolute",
        left: originalPosition.left,
        top: originalPosition.top,
        width: originalPosition.width,
        height: originalPosition.height,
        zIndex: "10210",
      });
    });
  }

  // Shrink and hide protestors
  shrink() {
    if (!this.wrapper) return;

    // Set up shrink animation
    this.wrapper.style.transformOrigin = "bottom center";
    this.wrapper.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
    this.wrapper.style.opacity = "0";
    this.wrapper.style.transform = "scale(1, 0.2) translateY(10px)";

    // After animation, call hide
    if (this.shrinkTimeout) {
      clearTimeout(this.shrinkTimeout);
    }

    this.shrinkTimeout = setTimeout(() => {
      if (this.callbacks.onHide) {
        this.callbacks.onHide(this.countryId);
      }
    }, 500);
  }

  // Clean up all resources
  cleanup() {
    // Stop animations
    Object.values(this.animations).forEach((animId) => {
      if (animId) {
        window.animationManager.stopSpriteAnimation(animId);
      }
    });
    this.animations = {};

    // Clear timeouts
    if (this.disappearTimeout) {
      clearTimeout(this.disappearTimeout);
      this.disappearTimeout = null;
    }

    if (this.shrinkTimeout) {
      clearTimeout(this.shrinkTimeout);
      this.shrinkTimeout = null;
    }

    // Remove main elements
    const elementsToClean = [
      this.wrapper,
      document.getElementById(`${this.countryId}-protestors-outline`),
      document.getElementById(`${this.countryId}-glow-wrapper`),
    ];

    elementsToClean.forEach((element) => {
      if (element && element.parentNode) {
        // Remove event listeners if we stored any
        if (element._glowListeners) {
          Object.entries(element._glowListeners).forEach(([event, handler]) => {
            element.removeEventListener(event, handler);
          });
          element._glowListeners = null;
        }

        element.parentNode.removeChild(element);
      }
    });

    this.wrapper = null;
    this.element = null;
  }
}
