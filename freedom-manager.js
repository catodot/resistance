class FreedomManager {
  // ===== CONSTANTS =====

  static Z_INDEXES = {
    BASE: 500,
    CONFETTI: 505,
    FIREWORKS: 510,
    FLASH: 0,
    TEXT: 520,
    PROTESTORS: 525,
  };

  static MOBILE_CONFIG = {
    CONFETTI_COUNT: 20, // Reduced from 60
    FIREWORK_COUNT: 8, // Reduced from 15-25
    PROTESTOR_SCALE: {
      SUPPORT_CLICK: 2.1,
    },
    ANIMATION_CLEANUP_DELAY: 50,
  };

  static SOUND_STATES = {
    INITIAL: "initial",
    PLAYING: "playing",
    STOPPED: "stopped",
    ERROR: "error",
  };

  static PROTESTOR_TIMING = {
    // Regular (non-USA) protestors
    INITIAL_ANNEX_MIN_DELAY: 5000,
    INITIAL_ANNEX_MAX_DELAY: 20000,
    FADE_AWAY_TIME: 4000,
    REGENERATION_DELAY: 50000,

    // USA protestors
    USA_INITIAL_APPEARANCE_THRESHOLD: 0.6,
    USA_REAPPEAR_MIN_TIME: 15000,
    USA_REAPPEAR_MAX_TIME: 20000,
  };

  // ===== CONSTRUCTOR & INITIALIZATION =====

  constructor(gameState, elements, audioManager, config = {}, gameEngine) {
    this.gameState = gameState;
    this.elements = elements;
    this.audioManager = audioManager;
    this.gameEngine = gameEngine;
    this.animationManager = animationManager;

    // Initialization
    this.usaTimingCheckDone = false;
    this.glowOutline = new GlowOutline();

    this.visualEffectsManager = new VisualEffectsManager(FreedomManager.Z_INDEXES);

    // Trump size state
    this.trumpShrinkLevel = 0;
    this.trumpSizeState = {
      currentSize: "normal", // 'normal', 'small', 'smaller', 'smallest'
      sizeIndex: 0, // 0-3 matching the size arrays
      sizes: ["normal", "small", "smaller", "smallest"],
      transitioning: false,
    };

    // Configuration with defaults
    this.config = {
      effectsEnabled: {
        confetti: true,
        screenShake: true,
        fireworks: true,
      },
      ...config,
    };

    // Set up logger reference
    this.logger = this._initLogger();

    this.countries = this._initCountries();

    // Initialize protestor hitbox manager
    this._initProtestorHitboxManager();

    this.hasShownFirstProtestors = false;

    // Create containers for particles
    this._createParticleContainers();

    this.protestorManager = new ProtestorManager(
      gameState,
      elements,
      audioManager,
      {
        Z_INDEXES: FreedomManager.Z_INDEXES,
        MOBILE_CONFIG: FreedomManager.MOBILE_CONFIG,
        PROTESTOR_TIMING: FreedomManager.PROTESTOR_TIMING,
      },
      gameEngine,
      this.logger
    );

    // this.logger.info("freedom", "Enhanced Freedom Manager initialized");
  }

  _initLogger() {
    return (
      window.logger || {
        debug: (category, message) => console.log(`[DEBUG] ${category}: ${message}`),
        info: (category, message) => console.log(`[INFO] ${category}: ${message}`),
        warn: (category, message) => console.warn(`[WARN] ${category}: ${message}`),
        error: (category, message) => console.error(`[ERROR] ${category}: ${message}`),
      }
    );
  }

  _initCountries() {
    return {
      canada: this._createCountryState("canada"),
      mexico: this._createCountryState("mexico"),
      greenland: this._createCountryState("greenland"),
      usa: this._createCountryState("usa"),
    };
  }

  _createCountryState(id) {
    return {
      id,
      annexTime: 0,
      disappearTimeout: null,
      initialDelaySet: false,
      initialDelay: null,
      animations: {},
      protestorWrapper: null,
      currentScale: 1.0,
    };
  }

  _initProtestorHitboxManager() {
    if (!window.protestorHitboxManager) {
      // this.logger.info("freedom", "Creating new Protestor Hitbox Manager");
      window.protestorHitboxManager = new ProtestorHitboxManager(true); // Pass flag for lazy initialization
    }
    this.protestorHitboxManager = window.protestorHitboxManager;
  }

  _removeCountryFlags(countryId) {
    console.log(`Removing flags for country: ${countryId}`);

    if (!countryId || !this.gameState || !this.gameState.countries[countryId]) {
      console.log(`Invalid parameters for flag removal`);
      return;
    }

    const country = this.gameState.countries[countryId];

    // Initialize flags array if it doesn't exist
    if (!country.flags) {
      country.flags = [];
      console.log(`Initialized flags array for ${countryId}`);
      return;
    }

    if (country.flags.length === 0) {
      console.log(`No flags to remove for ${countryId}`);
      return;
    }

    // Remove each flag (single loop)
    country.flags.forEach((flagInfo, index) => {
      console.log(`[removeCountryFlags] Processing flag ${index}:`, flagInfo);

      // Stop the animation
      if (flagInfo.animationId && window.animationManager) {
        console.log(`[removeCountryFlags] Stopping animation ${flagInfo.animationId}`);
        window.animationManager.stopSpriteAnimation(flagInfo.animationId);
      } else if (!window.animationManager) {
        console.warn(`[removeCountryFlags] window.animationManager is not available!`);
      }

      // Remove the element with animation
      if (flagInfo.element) {
        console.log(`[removeCountryFlags] Adding fade-out animation to flag element`);
        flagInfo.element.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        flagInfo.element.style.opacity = "0";
        flagInfo.element.style.transform = "scale(0.5) rotate(45deg)";

        // Remove after animation
        setTimeout(() => {
          if (flagInfo.element && flagInfo.element.parentNode) {
            console.log(`[removeCountryFlags] Removing flag element from DOM`);
            flagInfo.element.parentNode.removeChild(flagInfo.element);
          } else {
            console.warn(`[removeCountryFlags] Could not remove flag element - missing element or parent`);
          }
        }, 500);
      } else {
        console.warn(`[removeCountryFlags] Flag ${index} has no element!`);
      }
    });

    // Clear the flags array
    country.flags = [];
    console.log(`All flags removed for ${countryId}`);
  }

  _createParticleContainers() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      this.logger.error("freedom", "Game container not found for particle containers");
      return;
    }

    // Create one container per country
    Object.keys(this.countries).forEach((countryId) => {
      // Check if container already exists
      if (document.getElementById(`${countryId}-particles`)) {
        return;
      }

      const container = document.createElement("div");
      container.id = `${countryId}-particles`;
      container.className = "freedom-particles";
      container.style.position = "absolute";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";
      container.style.zIndex = FreedomManager.Z_INDEXES.BASE;
      container.style.overflow = "hidden";

      gameContainer.appendChild(container);
      // this.logger.debug("freedom", `Created particle container for ${countryId}`);
    });
  }

  // ===== DOM HELPER METHODS =====

  /**
   * Get DOM element safely with logging
   * @private
   * @param {string} id - Element ID
   * @param {string} context - Context for error logging
   * @returns {HTMLElement|null} - The element or null if not found
   */
  _getElement(id, context) {
    const element = document.getElementById(id);
    // Error log only if context is critical
    if (!element) {
      if (context === "critical") {
        this.logger.error("freedom", `Element ${id} not found for ${context}`);
      } else {
        this.logger.debug("freedom", `Element ${id} not found for ${context}`);
      }
    }
    return element;
  }

  /**
   * Get game container element
   * @private
   * @returns {HTMLElement|null} - Game container or null
   */
  _getGameContainer() {
    return this._getElement("game-container", "operation");
  }

  /**
   * @private
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random number between min and max
   */
  _getRandomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Determine if the device is mobile
   * @private
   * @returns {boolean} - True if mobile device detected
   */
  _isMobile() {
    return window.DeviceUtils && window.DeviceUtils.isMobile();
  }

  // ===== GAME STATE MANAGEMENT =====

  /**
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    const startTime = performance.now();

    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    // Delegate protestor management to the protestorManager
    this.protestorManager.update(deltaTime);

    const processingTime = performance.now() - startTime;
    if (processingTime > 16) {
      // More than one frame
      console.warn("Performance warning: Update took too long", processingTime);
    }
  }

  updateFlagOpacity(countryId) {
    const flagOverlay = this._getElement(`${countryId}-flag-overlay`, "flag update");
    if (!flagOverlay) return;

    const gameCountry = this.gameState.countries[countryId];
    if (!gameCountry) {
      this.logger.error("freedom", `Country ${countryId} not found in game state!`);
      return;
    }

    const claims = gameCountry.claims;

    // Remove previous opacity classes
    flagOverlay.classList.remove("opacity-33", "opacity-66", "opacity-100");

    // Add appropriate class based on claims
    if (claims === 0) {
      flagOverlay.style.opacity = "0"; // Use string "0" instead of number 0
    } else if (claims === 1) {
      flagOverlay.classList.add("opacity-33");
      flagOverlay.style.opacity = ""; // Clear direct opacity styling
    } else if (claims === 2) {
      flagOverlay.classList.add("opacity-66");
      flagOverlay.style.opacity = ""; // Clear direct opacity styling
    } else if (claims === 3) {
      flagOverlay.classList.add("opacity-100");
      flagOverlay.style.opacity = ""; // Clear direct opacity styling
    }
  }

  cleanupAllEffects() {
    // Clean up all protestors
    this.protestorManager.cleanupAllProtestors();

    // Clean up visual effects
    this.visualEffectsManager.cleanupAll();

    // Remove any resistance indicators
    document.querySelectorAll(".resistance-possible").forEach((el) => {
      el.classList.remove("resistance-possible");
    });

    if (window.animationManager) {
      window.animationManager.reset();
    }
  }

  /**
   * Clean up all sound resources
   */
  cleanup() {}

  // ===== TRUMP SIZE MANAGEMENT =====

  /**
   * Get Trump's current size
   * @returns {Object} Trump size state
   */
  getTrumpSize() {
    return {
      size: this.trumpSizeState.currentSize,
      index: this.trumpSizeState.sizeIndex,
      isTransitioning: this.trumpSizeState.transitioning,
    };
  }

  /**
   * Reset Trump size to normal
   */
  resetTrumpSize() {
    this.trumpSizeState = {
      currentSize: "normal",
      sizeIndex: 0,
      sizes: ["normal", "small", "smaller", "smallest"],
      transitioning: false,
    };

    // Update sprite if animation manager exists
    if (this.animationManager?.trumpSprite && this.animationManager.currentState) {
      const baseState = this.animationManager.currentState.replace(/(Small|Smaller|Smallest)$/, "");
      if (this.animationManager.animations?.[baseState]?.spriteSheet) {
        this.animationManager.trumpSprite.style.backgroundImage = `url('${this.animationManager.animations[baseState].spriteSheet}')`;
      }
    }
  }

  handleProtestorClick(countryId) {
    this.protestorManager.handleProtestorClick(countryId);
  }
  /**
   * Handle USA third click (Trump shrink sequence)
   */
  handleUSASupportClick() {
    this._handleUSAShrinkSequence();
    this.protestorManager.hideProtestors("usa");
  }

  _handleUSAShrinkSequence() {
    console.log("bbb _handleUSAShrinkSequence");

    // Get or create effect container
    let effectContainer = document.getElementById("shrink-effects-container");
    if (!effectContainer) {
      effectContainer = document.createElement("div");
      effectContainer.id = "shrink-effects-container";
      effectContainer.style.position = "absolute";
      effectContainer.style.top = "0";
      effectContainer.style.left = "0";
      effectContainer.style.width = "100%";
      effectContainer.style.height = "100%";
      effectContainer.style.pointerEvents = "none";
      effectContainer.style.zIndex = "4";
      document.getElementById("game-container").appendChild(effectContainer);
    }

    this.trumpShrinkLevel++;
    const isFinalShrink = this.trumpShrinkLevel >= 4;

    // Create shrink effect centered on Trump
    this.createShrinkEffect(effectContainer, isFinalShrink);

    const shrinkMessages = ["YOU SHRUNK TRUMP!", "SHRINKY DINK!", "BITE-SIZED!", "BYE TRUMPY!"];
    const currentMessage = shrinkMessages[this.trumpShrinkLevel - 1] || shrinkMessages[2];

    // Use the GameSpeedManager's notification system
    if (window.speedManager) {
      window.speedManager.showNotification(currentMessage);
    }

    // Add screen shake
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.classList.add(isFinalShrink ? "heavy-screen-shake" : "screen-shake");
      setTimeout(
        () => {
          gameContainer.classList.remove("screen-shake", "heavy-screen-shake");
        },
        isFinalShrink ? 1000 : 500
      );
    }

    // Update Trump size state
    const sizes = ["normal", "small", "smaller", "smallest", "tiniest"];
    this.trumpSizeState = {
      currentSize: sizes[this.trumpShrinkLevel] || "smallest",
      sizeIndex: this.trumpShrinkLevel,
      sizes: sizes,
      transitioning: false,
    };

    if (this.animationManager?.trumpSprite) {
      const targetSize = sizes[this.trumpShrinkLevel];
      const currentState = this.animationManager.currentState;
      const targetState =
        currentState.replace(/(Small|Smaller|Smallest)$/, "") +
        (targetSize === "normal" ? "" : targetSize.charAt(0).toUpperCase() + targetSize.slice(1));

      if (this.animationManager.animations?.[targetState]?.spriteSheet) {
        // Delay so effect starts first
        setTimeout(() => {
          this.animationManager.trumpSprite.style.backgroundImage = `url('${this.animationManager.animations[targetState].spriteSheet}')`;
          this.currentTrumpSize = targetSize;
        }, 100);
      }
    }

    // Hide protestors
    this.protestorManager.hideProtestors("usa");

    if (this.audioManager) {
      setTimeout(() => {
        if (isFinalShrink) {
          this.audioManager.playRandom("trump", "finalShrink", null, 0.9);
        } else {
          this.audioManager.playRandom("trump", "shrink", null, 0.7);
        }
      }, 50);
    }

    // Handle final shrink
    if (isFinalShrink) {
      // Big burst at moment of destruction
      const celebrationContainer = document.getElementById("game-container");
      const trumpPosition = this._getTrumpPosition();
      if (celebrationContainer && trumpPosition && !window.DEBUG_DISABLE.particles) {
        this.visualEffectsManager.createConfettiBurst(trumpPosition.x, trumpPosition.y, trumpPosition.width, trumpPosition.height, celebrationContainer);
        this.visualEffectsManager.createFireworkBurst(trumpPosition.x, trumpPosition.y, trumpPosition.width, trumpPosition.height, celebrationContainer);
      }

      // Force angry/defeated state before ending
      if (this.animationManager?.trumpSprite) {
        const endStateAnimation = "angryIdle";

        // Check if the animation exists before changing
        if (this.animationManager.animations?.[endStateAnimation]) {
          this.animationManager.changeState(endStateAnimation);
        }
      }

      // Let animation start before ending
      setTimeout(() => {
        this.gameEngine.triggerGameEnd(this.gameEngine.END_STATES.TRUMP_DESTROYED, "trump_destroyed");
      }, 200);
    }
  }

  _getTrumpPosition() {
    console.log("Calculating Trump's Position - Start");

    // Get the map element and game container
    const mapElement = document.getElementById("map-background");
    const gameContainer = document.getElementById("game-container");
    const reddotElement = document.getElementById("reddot");

    console.log("Map Element:", mapElement);
    console.log("Game Container:", gameContainer);
    console.log("Reddot Element:", reddotElement);

    if (!mapElement || !gameContainer || !reddotElement) {
      console.warn("Map, Game Container, or Reddot not found! Using screen center fallback.");
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        width: 100,
        height: 150,
      };
    }

    // Get container positions
    const mapRect = mapElement.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    console.log("Map Rectangle:", {
      left: mapRect.left,
      top: mapRect.top,
      width: mapRect.width,
      height: mapRect.height,
      naturalWidth: mapElement.naturalWidth,
    });

    console.log("Container Rectangle:", {
      left: containerRect.left,
      top: containerRect.top,
      width: containerRect.width,
      height: containerRect.height,
    });

    // Calculate map offset from game container
    const mapOffsetX = mapRect.left - containerRect.left;
    const mapOffsetY = mapRect.top - containerRect.top;

    console.log("Map Offset:", {
      x: mapOffsetX,
      y: mapOffsetY,
    });

    // Calculate current scale of the map
    const currentMapScale = mapRect.width / mapElement.naturalWidth;

    console.log("Current Map Scale:", currentMapScale);

    // Get current animation from animation manager
    const currentAnimation = window.animationManager?.getCurrentAnimation();
    const animationName = currentAnimation?.name || "idle";

    // Determine base coordinates based on animation
    const trumpBaseCoords = animationName.includes("grabWestCanada")
      ? { x: 1000, y: 2200, width: 150, height: 200, calibrationScale: 0.24 }
      : animationName.includes("grabEastCanada") || animationName.includes("grabGreenland")
      ? { x: 1400, y: 2200, width: 150, height: 200, calibrationScale: 0.24 }
      : { x: 1200, y: 2200, width: 150, height: 200, calibrationScale: 0.24 };

    console.log("Trump Base Coordinates:", trumpBaseCoords);

    // Scale coordinates based on current map scale
    const scaledX = trumpBaseCoords.x * currentMapScale;
    const scaledY = trumpBaseCoords.y * currentMapScale;
    const scaledWidth = trumpBaseCoords.width * currentMapScale;
    const scaledHeight = trumpBaseCoords.height * currentMapScale;

    console.log("Scaled Coordinates:", {
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Calculate final position within the game container
    const finalX = mapOffsetX + scaledX;
    const finalY = mapOffsetY + scaledY;

    const finalPosition = {
      x: finalX,
      y: finalY,
      width: scaledWidth,
      height: scaledHeight,
    };

    console.log("Final Trump Position:", finalPosition);

    // Position the reddot element
    if (reddotElement) {
      reddotElement.style.position = "absolute";
      reddotElement.style.left = `${finalPosition.x}px`;
      reddotElement.style.top = `${finalPosition.y}px`;
      reddotElement.style.width = `${finalPosition.width}px`;
      reddotElement.style.height = `${finalPosition.height}px`;
    }

    return finalPosition;
  }

  createShrinkEffect(container, isFinal = false) {
    // Get Trump's position
    const trumpPosition = this._getTrumpPosition();

    console.log("Creating Shrink Effect with Position:", trumpPosition);

    // Create the effect wrapper
    const effect = document.createElement("div");
    effect.className = `shrink-effect ${isFinal ? "final-shrink" : ""}`;

    // Calculate the center point of Trump
    const centerX = trumpPosition.x + trumpPosition.width / 2;
    const centerY = trumpPosition.y + trumpPosition.height / 2;

    // Set absolute positioning centered on Trump
    effect.style.position = "absolute";
    effect.style.left = `${centerX}px`;
    effect.style.top = `${centerY}px`;
    effect.style.transform = "translate(-50%, -50%)"; // This centers the effect precisely

    effect.style.width = "60vw";
    effect.style.height = "60vh";

    // Log CSS variable settings
    console.log("Setting CSS Variables:", {
      "--trump-x": `${centerX}px`,
      "--trump-y": `${centerY}px`,
      "--trump-width": `${trumpPosition.width}px`,
      "--trump-height": `${trumpPosition.height}px`,
    });

    // CSS variables, positioned relative to Trump
    effect.style.setProperty("--trump-x", `${centerX}px`);
    effect.style.setProperty("--trump-y", `${centerY}px`);
    effect.style.setProperty("--trump-width", `${trumpPosition.width}px`);
    effect.style.setProperty("--trump-height", `${trumpPosition.height}px`);

    // Create star impact
    const starImpact = document.createElement("div");
    starImpact.className = "star-impact";
    effect.appendChild(starImpact);

    // Create flash effect
    const flash = document.createElement("div");
    flash.className = "flash-effect";
    effect.appendChild(flash);

    // Create shards
    for (let i = 1; i <= 4; i++) {
      const shardy = document.createElement("div");
      shardy.className = `shardy shardy${i}`;
      effect.appendChild(shardy);
    }

    // Create SVG arcs
    this._createShrinkArcs(effect);

    // Insert effect at start of container
    container.insertBefore(effect, container.firstChild);

    // Remove effect after animation
    setTimeout(
      () => {
        effect.remove();
      },
      isFinal ? 2000 : 1500
    );
  }

  _createShrinkArcs(effect) {
    const svgNS = "http://www.w3.org/2000/svg";

    const arcContainer1 = document.createElement("div");
    arcContainer1.className = "hand-drawn-arc";
    arcContainer1.style.animation = "shrink-arc-outer 0.8s ease-in forwards";

    const arcContainer2 = document.createElement("div");
    arcContainer2.className = "hand-drawn-arc";
    arcContainer2.style.animation = "shrink-arc-inner 0.8s ease-in forwards 0.3s";

    const svgOuter = document.createElementNS(svgNS, "svg");
    svgOuter.setAttribute("width", "100%");
    svgOuter.setAttribute("height", "100%");
    svgOuter.setAttribute("viewBox", "-250 -250 500 500");

    const svgInner = document.createElementNS(svgNS, "svg");
    svgInner.setAttribute("width", "100%");
    svgInner.setAttribute("height", "100%");
    svgInner.setAttribute("viewBox", "-250 -250 500 500");

    const createWobblyArc = (startAngle, endAngle, radius, variation) => {
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const arcLength = endRad - startRad;
      const numPoints = Math.max(8, Math.floor(arcLength * 8)); // Reduced from 12 and 15
      const angleStep = arcLength / numPoints;

      let pathData = "";
      for (let i = 0; i <= numPoints; i++) {
        const angle = startRad + angleStep * i;
        const wobble = Math.random() * variation * 4 - variation * 2;
        const r = radius + wobble;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        if (i === 0) {
          pathData += `M ${x} ${y} `;
        } else {
          const prevAngle = startRad + angleStep * (i - 1);
          const cpAngle = prevAngle + angleStep * 0.3;
          const cpWobble = Math.random() * variation * 4 - variation * 2;
          const cpRadius = radius + cpWobble;
          const cpx = cpRadius * Math.cos(cpAngle);
          const cpy = cpRadius * Math.sin(cpAngle);
          pathData += `Q ${cpx} ${cpy} ${x} ${y} `;
        }
      }

      const outlinePath = document.createElementNS(svgNS, "path");
      outlinePath.setAttribute("d", pathData);
      outlinePath.setAttribute("class", "arc-outline");
      outlinePath.style.stroke = "#000";
      outlinePath.style.strokeWidth = "16px";
      outlinePath.style.fill = "none";
      outlinePath.style.strokeLinecap = "round";
      outlinePath.style.strokeLinejoin = "round";

      const fillPath = document.createElementNS(svgNS, "path");
      fillPath.setAttribute("d", pathData);
      fillPath.setAttribute("class", "arc-fill");
      fillPath.style.stroke = "white";
      fillPath.style.strokeWidth = "4px";
      fillPath.style.fill = "none";
      fillPath.style.strokeLinecap = "round";
      fillPath.style.strokeLinejoin = "round";

      return [outlinePath, fillPath];
    };

    const outerArcs = [
      { start: 0, end: 85, radius: 200, variation: 15 },
      { start: 95, end: 175, radius: 210, variation: 12 },
      { start: 185, end: 265, radius: 205, variation: 18 },
      { start: 275, end: 355, radius: 215, variation: 14 },
    ];

    const innerArcs = [
      { start: 20, end: 100, radius: 150, variation: 10 }, // Increased from 120
      { start: 110, end: 190, radius: 155, variation: 8 }, // Increased from 125
      { start: 200, end: 280, radius: 160, variation: 12 }, // Increased from 130
      { start: 290, end: 370, radius: 158, variation: 9 }, // Increased from 128
    ];

    // Create the arcs
    outerArcs.forEach((arcData) => {
      const [outline, fill] = createWobblyArc(arcData.start, arcData.end, arcData.radius, arcData.variation);
      svgOuter.appendChild(outline);
      svgOuter.appendChild(fill);
    });

    innerArcs.forEach((arcData) => {
      const [outline, fill] = createWobblyArc(arcData.start, arcData.end, arcData.radius, arcData.variation);
      svgInner.appendChild(outline);
      svgInner.appendChild(fill);
    });

    arcContainer1.appendChild(svgOuter);
    arcContainer2.appendChild(svgInner);

    effect.appendChild(arcContainer1);
    effect.appendChild(arcContainer2);
  }

  // ===== COUNTRY RESISTANCE EFFECTS =====

  // One click fully liberates the country
  applyCountrySupport(countryId) {
    if (!this.gameState.countries[countryId]) return;

    // Already resets claims and flag overlay
    this.triggerCountryResistance(countryId);
  }

  triggerCountryResistance(countryId) {
    // this.logger.info("freedom", `MAJOR RESISTANCE in ${countryId}!`);

    // Add 50 points for successful revolution
    if (this.gameState) {
      let scoreElement = document.getElementById("score");
      scoreElement.classList.add("score-bounce");
      setTimeout(() => {
        scoreElement.classList.remove("score-bounce");
      }, 500);

      this.gameState.score += 50;
      // Update HUD
      this.gameEngine.systems.ui.updateHUD(this.gameState);
      // Announce for screen readers
      this.gameEngine.systems.ui.announceForScreenReaders(`Revolution successful! +50 points. Total score: ${this.gameState.score}`);
    }

    // Remove pulsing effect if it exists
    const countryElement = this.elements.countries[countryId];
    if (countryElement) {
      countryElement.classList.remove("resistance-possible");
    }

    console.log("nnnn about to remove flags");

    // Remove Trump flags from the country
    this._removeCountryFlags(countryId);

    if (this.gameState.countries[countryId]) {
      this.gameState.countries[countryId].claims = 0;
    }

    const flagOverlay = this._getElement(`${countryId}-flag-overlay`, "resistance");
    if (flagOverlay) {
      flagOverlay.classList.remove("opacity-33", "opacity-66", "opacity-100");
      flagOverlay.style.opacity = "0";
    }

    // ANNOUNCEMENT: Make liberation announcement
    this.makeCountryLiberationAnnouncement(countryId);

    // Store position data before removing elements
    const positionData = this._capturePositionData(countryId);

    // Create celebration effects
    this._createResistanceCelebration(countryId, positionData);

    this._playResistanceAnimation(countryId);

    // IMPORTANT: Delay protestor cleanup until after animation
    setTimeout(() => {
      this.protestorManager.hideProtestors(countryId);
    }, this.config.animationDuration + 100); // Add small buffer after animation

    // Reset claims in game state
    if (this.gameState.countries[countryId]) {
      this.gameState.countries[countryId].claims = 0;
    }
    return true;
  }

  makeCountryLiberationAnnouncement(countryId) {
    // Sound only; banner was too noisy
    if (window.audioManager) {
      window.audioManager.play("ui", `${countryId}Liberated`, 0.8);
    }
  }

  _capturePositionData(countryId) {
    const protestorWrapper = this._getElement(`${countryId}-protestors-wrapper`, "position capture");
    const hitbox = this.protestorHitboxManager?.protestorHitboxes[countryId]?.element;

    if (protestorWrapper) {
      const gameContainer = this._getGameContainer();
      if (!gameContainer) return null;

      const containerRect = gameContainer.getBoundingClientRect();
      const wrapperRect = protestorWrapper.getBoundingClientRect();

      return {
        source: "wrapper",
        left: wrapperRect.left - containerRect.left,
        top: wrapperRect.top - containerRect.top,
        width: wrapperRect.width,
        height: wrapperRect.height,
      };
    } else if (hitbox) {
      const gameContainer = this._getGameContainer();
      if (!gameContainer) return null;

      const containerRect = gameContainer.getBoundingClientRect();
      const hitboxRect = hitbox.getBoundingClientRect();

      return {
        source: "hitbox",
        left: hitboxRect.left - containerRect.left,
        top: hitboxRect.top - containerRect.top,
        width: hitboxRect.width,
        height: hitboxRect.height,
      };
    }

    // Fallback coordinates as last resort
    const fallbackCoords = {
      canada: { left: 117, top: 328, width: 35, height: 35 },
      mexico: { left: 126, top: 440, width: 35, height: 35 },
      greenland: { left: 249, top: 208, width: 35, height: 35 },
    };

    if (fallbackCoords[countryId]) {
      return {
        source: "fallback",
        ...fallbackCoords[countryId],
      };
    }

    return null;
  }

  _createResistanceCelebration(countryId, positionData) {
    const gameContainer = this._getGameContainer();
    if (!gameContainer || !positionData) return;

    // Generate effect options based on config
    const effectOptions = {
      playSound: true,
      screenShake: this.config.effectsEnabled.screenShake,
      confetti: this.config.effectsEnabled.confetti,
      fireworks: this.config.effectsEnabled.fireworks,
    };

    // Delegate celebration to visual effects manager
    this.visualEffectsManager.createResistanceCelebration(countryId, positionData, gameContainer, effectOptions);

    // Handle audio separately if needed
    if (this.audioManager) {
      this.audioManager.playRandom("particles", "freedom", null, 0.8);
    }
  }

  _playResistanceAnimation(countryId) {
    let smackAnimation = "";

    // Map country to correct animation
    if (countryId === "canada") {
      smackAnimation = Math.random() < 0.5 ? "smackEastCanada" : "smackWestCanada";
    } else if (countryId === "mexico") {
      smackAnimation = "smackMexico";
    } else if (countryId === "greenland") {
      smackAnimation = "smackGreenland";
    }

    if (smackAnimation && (window.animationManager || this.animationManager)) {
      const animationManager = window.animationManager || this.animationManager;

    }
  }

  // ===== SYSTEM LIFECYCLE METHODS =====

  /**
   * Pause the freedom manager
   */
  pause() {
    // this.logger.info("freedom", "Pausing Freedom Manager");

    this.protestorManager.pause();

    this.visualEffectsManager.pause();

    // Snapshot animation and timer state
    this._pausedState = {
      disappearTimeouts: {},
    };
  }

  /**
   * Resume the freedom manager
   */
  resume() {
    // Ensure we have a saved paused state
    if (!this._pausedState) {
      return;
    }

    this.protestorManager.resume();

    this.visualEffectsManager.resume();

    // Restore disappear timeouts
    Object.keys(this._pausedState.disappearTimeouts).forEach((countryId) => {
      const timeout = this._pausedState.disappearTimeouts[countryId];
      if (timeout) {
        this.countries[countryId].disappearTimeout = setTimeout(() => {
          this._shrinkAndHideProtestors(countryId);
        }, timeout - (Date.now() - timeout.startTime));
      }
    });

    // Clear the paused state
    this._pausedState = null;
  }

  /**
   * Reset the freedom manager
   */
  reset() {
    // Clear all timers

    this.protestorManager.reset();

    // this.logger.info("freedom", "Resetting Freedom Manager");

    // Stop ALL animations first
    this.cleanupAllEffects();

    // Re-initialize protestor hitbox manager
    this._initProtestorHitboxManager();

    // Reset ALL country states
    Object.keys(this.countries).forEach((countryId) => {
      // Full country state reset
      this.countries[countryId] = {
        id: countryId,
        annexTime: 0,
      };

      // Reset visual state of country overlay
      const flagOverlay = this._getElement(`${countryId}-flag-overlay`, "reset");
      if (flagOverlay) {
        flagOverlay.classList.remove("opacity-33", "opacity-66", "opacity-100", "resistance-possible", "targeting-pulse");
        flagOverlay.style.opacity = "";
      }
    });

    // Reset trump size
    this.trumpShrinkLevel = 0;
    this.resetTrumpSize();
  }

  destroy() {
    // Stop all sounds first
    if (this.audioManager) {
      this.audioManager.stopAll();
    }

    // Clean up all effects and protestors
    this.cleanupAllEffects();

    this.protestorManager.destroy();


    // Reset internal state for all countries
    Object.keys(this.countries).forEach((countryId) => {
      const country = this.countries[countryId];
      country.annexTime = 0;
    });

  }

  // ===== DEBUG METHODS =====

  /**
   * Debug method to set country claims
   * @param {string} countryId - Country identifier
   * @param {number} claimLevel - Number of claims to set
   * @returns {boolean} - Success status
   */
  setCountryClaims(countryId, claimLevel) {
    const gameCountry = this.gameState.countries[countryId];
    if (!gameCountry) {
      this.logger.error("freedom", `Country ${countryId} not found in gameState`);
      return false;
    }

    const maxClaims = gameCountry.maxClaims;
    const newClaims = Math.max(0, Math.min(claimLevel, maxClaims));

    gameCountry.claims = newClaims;
    this.updateFlagOpacity(countryId);

    return true;
  }

}
