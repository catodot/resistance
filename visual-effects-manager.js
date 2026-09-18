/**
 * Visual Effects Manager to handle all effects including text and flashes
 */

class VisualEffectsManager {
  constructor(zIndexes) {
    this.Z_INDEXES = zIndexes || {
      BASE: 500,
      CONFETTI: 505,
      FIREWORKS: 510,
      FLASH: 0,
      TEXT: 520,
    };

    this.particleSystem = new ParticleSystem(this.Z_INDEXES);
    this.isMobile = this._isMobile();
    this.activeEffects = {
      flashes: [],
      texts: [],
    };
  }

  /**
   * Determine if the device is mobile
   * @private
   * @returns {boolean} - True if mobile device detected
   */
  _isMobile() {
    return window.DeviceUtils && window.DeviceUtils.isMobile();
  }

  /**
   * Create a resistance celebration with multiple effects
   * @param {string} countryId - Country identifier
   * @param {Object} positionData - Position data for the effect
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Effect options
   */
  createResistanceCelebration(countryId, positionData, container, options = {}) {
    if (!container || !positionData) return;

    const { left, top, width, height } = positionData;
    const effectOptions = {
      playSound: true,
      screenShake: true,
      confetti: true,
      fireworks: true,
      ...options,
    };

    // Create flash effect
    if (!window.DEBUG_DISABLE.flash) {
      this.createFlashEffect(left, top, width, height, container);
    }

    // Add resistance text
    if (!window.DEBUG_DISABLE.resistanceText) {
      this.createResistanceText(left, top, width, height, container);
    }

    // Add particle effects based on options
    if (effectOptions.confetti && !window.DEBUG_DISABLE.particles) {
      this.createConfettiBurst(left, top, width, height, container);
    }

    if (effectOptions.fireworks && !window.DEBUG_DISABLE.particles) {
      this.createFireworkBurst(left, top, width, height, container);
    }

    // Screen shake effect
    if (effectOptions.screenShake && !window.DEBUG_DISABLE.screenShake) {
      this.applyScreenShake(container, false);
    }
  }

  /**
   * Create a flash effect
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {HTMLElement} container - Container element
   */
  createFlashEffect(left, top, width, height, container) {
    const flash = document.createElement("div");
    flash.className = "freedom-flash mobile-optimized";
    Object.assign(flash.style, {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: "10%",
      zIndex: this.Z_INDEXES.FLASH,
    });
    container.appendChild(flash);

    // Track flash for cleanup
    this.activeEffects.flashes.push(flash);

    // Cleanup flash after animation
    setTimeout(() => this._cleanupElement(flash, "freedom-flash"), 1500);
  }

  /**
   * Create resistance text effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {HTMLElement} container - Container element
   * @param {string} message - Optional custom message
   */
  createResistanceText(x, y, width, height, container, message = "!") {
    const text = document.createElement("div");
    text.className = "freedom-text";
    text.textContent = message;
    text.style.position = "absolute";
    text.style.zIndex = this.Z_INDEXES.TEXT;

    // MUCH larger text
    text.style.fontSize = ".24rem";

    // Thicker outline
    text.style.webkitTextStroke = ".5px black";
    text.style.textStroke = ".5px black";

    // More vibrant color
    const hue = Math.floor(Math.random() * 60); // Randomize between red-yellow
    text.style.color = `hsl(${hue}, 100%, 50%)`;
    text.style.fontWeight = "900";

    // Calculate center position
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Position to allow for animation
    const textWidth = 300; // Generous width estimate
    text.style.width = `${textWidth}px`;
    text.style.left = `${centerX - textWidth / 2}px`;
    text.style.top = `${centerY - 30}px`;
    text.style.textAlign = "center";

    container.appendChild(text);
    this.activeEffects.texts.push(text);

    // Random rotation via CSS var, reuses shared animation
    const startRotation = -10 + Math.random() * 20;
    text.style.setProperty("--start-rot", `${startRotation}deg`);

    if (!document.getElementById("resistance-text-animation")) {
      const style = document.createElement("style");
      style.id = "resistance-text-animation";
      style.textContent = `
        @keyframes resistance-text-pop {
          0% { transform: scale(0.1) rotate(calc(var(--start-rot) - 15deg)); opacity: 0; }
          15% { transform: scale(1.6) rotate(calc(var(--start-rot) + 10deg)); opacity: 1; }
          30% { transform: scale(1.1) rotate(calc(var(--start-rot) - 8deg)); opacity: 1; }
          45% { transform: scale(1.4) rotate(calc(var(--start-rot) + 6deg)); opacity: 1; }
          65% { transform: scale(1.2) rotate(calc(var(--start-rot) - 4deg)); opacity: 1; }
          80% { transform: scale(1.3) rotate(calc(var(--start-rot) + 2deg)); opacity: 0.9; }
          100% { transform: scale(2.5) rotate(var(--start-rot)); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    text.style.animation = "resistance-text-pop 2.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards";

    // Remove text after animation
    setTimeout(() => {
      if (text.parentNode) {
        text.parentNode.removeChild(text);
      }
      const index = this.activeEffects.texts.indexOf(text);
      if (index !== -1) {
        this.activeEffects.texts.splice(index, 1);
      }
    }, 2500);
  }

  /**
   * Create a confetti burst effect
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {HTMLElement} container - Container element
   */
  createConfettiBurst(left, top, width, height, container) {
    this.particleSystem.createBurst({
      type: "confetti",
      position: { left, top, width, height },
      container,
      count: 60,
      mobileCount: 32,
    });
  }

  /**
   * Create a firework burst effect
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {HTMLElement} container - Container element
   */
  createFireworkBurst(left, top, width, height, container) {
    const burstLocations = this.isMobile
      ? [
          { x: left + width * 0.3, y: top + height * 0.3, delay: 0 },
          { x: left + width * 0.7, y: top + height * 0.4, delay: 300 },
        ]
      : [
          { x: left + width * 0.3, y: top + height * 0.3, delay: 0 },
          { x: left + width * 0.7, y: top + height * 0.4, delay: 300 },
          { x: left + width * 0.5, y: top + height * 0.2, delay: 600 },
        ];

    const burstArea = Math.min(width, height) * 0.3; // Create a reasonable area around burst point

    burstLocations.forEach((burst) => {
      setTimeout(() => {
        this.particleSystem.createBurst({
          type: "firework",
          position: {
            left: burst.x - burstArea / 2,
            top: burst.y - burstArea / 2,
            width: burstArea,
            height: burstArea,
          },
          container,
          count: 15 + Math.floor(Math.random() * 10),
          mobileCount: 14,
        });
      }, burst.delay);
    });
  }

  /**
   * Apply screen shake effect
   * @param {HTMLElement} container - Container element
   * @param {boolean} isHeavy - Whether to use a heavy shake
   */
  applyScreenShake(container, isHeavy = false) {
    if (!container) return;

    container.classList.add(isHeavy ? "heavy-screen-shake" : "screen-shake");

    setTimeout(
      () => {
        container.classList.remove("screen-shake", "heavy-screen-shake");
      },
      isHeavy ? 1000 : 500
    );
  }

  /**
   * Clean up an element with class removal
   * @private
   * @param {HTMLElement} element - Element to clean up
   * @param {string} className - Class name to remove
   */
  _cleanupElement(element, className) {
    if (!element || !element.parentNode) return;

    // Remove animation class
    if (className) {
      element.classList.remove(className);
    }

    // Force a reflow to ensure animation stops
    void element.offsetWidth;

    // Remove element
    element.parentNode.removeChild(element);

    // Remove from active effects
    Object.keys(this.activeEffects).forEach((key) => {
      const index = this.activeEffects[key].indexOf(element);
      if (index !== -1) {
        this.activeEffects[key].splice(index, 1);
      }
    });
  }

  /**
   * Pause all animations
   */
  pause() {
    this.particleSystem.pauseAll();
  }

  /**
   * Resume all animations
   */
  resume() {
    this.particleSystem.resumeAll();
  }

  /**
   * Clean up all effects
   */
  cleanupAll() {
    // Clean up particles
    this.particleSystem.cleanupAll();

    // Clean up flashes
    this.activeEffects.flashes.forEach((flash) => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    });
    this.activeEffects.flashes = [];

    // Clean up texts
    this.activeEffects.texts.forEach((text) => {
      if (text.parentNode) {
        text.parentNode.removeChild(text);
      }
    });
    this.activeEffects.texts = [];

    // Remove all freedom-related elements directly
    document.querySelectorAll(".freedom-flash, .freedom-text, .freedom-confetti, .freedom-firework").forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }
}
