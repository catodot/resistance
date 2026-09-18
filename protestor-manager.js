// ProtestorManager class to handle all protestor operations

class ProtestorManager {
  constructor(gameState, elements, audioManager, config, gameEngine, logger) {
    this.gameState = gameState;
    this.elements = elements;
    this.audioManager = audioManager;
    this.config = config;
    this.gameEngine = gameEngine;
    this.logger = logger || this._createDefaultLogger();

    // Initialization
    this.protestors = new Map(); // Map of countryId to Protestor instance
    this.protestorTimers = new Map(); // Map of countryId to timer IDs
    this.usaTimingCheckDone = false;

    // Set up country data
    this.countries = {};
    this._initCountries();

    // Initialize protestor hitbox manager
    this._initProtestorHitboxManager();
  }

  // Create default logger if none provided
  _createDefaultLogger() {
    return {
      debug: (category, message) => console.log(`[DEBUG] ${category}: ${message}`),
      info: (category, message) => console.log(`[INFO] ${category}: ${message}`),
      warn: (category, message) => console.warn(`[WARN] ${category}: ${message}`),
      error: (category, message) => console.error(`[ERROR] ${category}: ${message}`),
    };
  }

  // Initialize country data
  _initCountries() {
    const countryIds = ["canada", "mexico", "greenland", "usa"];

    countryIds.forEach((id) => {
      this.countries[id] = {
        id,
        annexTime: 0,
        protestorsShown: false,
        initialDelaySet: false,
        initialDelay: null,
      };
    });
  }

  // Initialize protestor hitbox manager
  _initProtestorHitboxManager() {
    if (!window.protestorHitboxManager) {
      // this.logger.info("freedom", "Creating new Protestor Hitbox Manager");
      window.protestorHitboxManager = new ProtestorHitboxManager(true); // Pass flag for lazy initialization
    }
    this.protestorHitboxManager = window.protestorHitboxManager;
  }

  update(deltaTime) {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    this._checkUSAInitialAppearance();
    this._updateCountries(deltaTime);
  }

  // Check if USA protestors should initially appear
  _checkUSAInitialAppearance() {
    if (this.usaTimingCheckDone) return;

    const totalGameTime = this.gameState.config.GAME_DURATION;
    const currentGameTime = totalGameTime - this.gameState.timeRemaining;
    const usaThreshold = totalGameTime * this.config.PROTESTOR_TIMING.USA_INITIAL_APPEARANCE_THRESHOLD;

    if (currentGameTime >= usaThreshold) {
      this.showProtestors("usa");
      this.usaTimingCheckDone = true;
    }
  }

  // Update country states
  _updateCountries(deltaTime) {
    Object.keys(this.countries).forEach((countryId) => {
      if (countryId === "usa") return; // Skip USA, handled separately

      const country = this.countries[countryId];
      const gameCountry = this.gameState.countries[countryId];

      if (!gameCountry) return;

      if (gameCountry.claims >= 1) {
        // Update annexation time
        country.annexTime += deltaTime;

        if (!country.protestorsShown && !country.initialDelaySet) {
          // Schedule first appearance
          this._scheduleProtestors(countryId);
        }
      } else {
        this._resetCountryState(country);
      }
    });
  }

  // Reset a country's state
  _resetCountryState(country) {
    const countryId = country.id;

    if (country.protestorsShown) {
      const protestor = this.protestors.get(countryId);
      // Avoid interrupting an in-progress click dismissal
      if (!protestor || !protestor.isDismissing) {
        this.hideProtestors(countryId);
      }
    }

    country.annexTime = 0;
    country.initialDelaySet = false;
    country.initialDelay = null;
  }

  // Schedule protestors to appear
  _scheduleProtestors(countryId) {
    // Clear any existing timer
    if (this.protestorTimers.has(countryId)) {
      clearTimeout(this.protestorTimers.get(countryId));
      this.protestorTimers.delete(countryId);
    }

    const isUSA = countryId === "usa";

    // Calculate delay based on country type
    let delay;
    if (isUSA) {
      delay = this._getRandomBetween(this.config.PROTESTOR_TIMING.USA_REAPPEAR_MIN_TIME, this.config.PROTESTOR_TIMING.USA_REAPPEAR_MAX_TIME);
    } else {
      if (!this.countries[countryId].initialDelaySet) {
        delay = this._getRandomBetween(this.config.PROTESTOR_TIMING.INITIAL_ANNEX_MIN_DELAY, this.config.PROTESTOR_TIMING.INITIAL_ANNEX_MAX_DELAY);
        this.countries[countryId].initialDelaySet = true;
      } else {
        delay = this.config.PROTESTOR_TIMING.REGENERATION_DELAY;
      }
    }

    // Set new timer with more robust callback
    const timerId = setTimeout(() => {
      this.protestorTimers.delete(countryId);

      // Check game state before showing protestors
      const gameIsRunning = this.gameEngine.systems.state.isPlaying && !this.gameState.isPaused;

      if (gameIsRunning) {
        this.showProtestors(countryId);
      } else {
        // Reschedule if conditions are not met
        this._scheduleProtestors(countryId);
      }
    }, delay);

    this.protestorTimers.set(countryId, timerId);
  }

  // Random number between min and max
  _getRandomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  // Get game container element
  _getGameContainer() {
    return document.getElementById("game-container");
  }

  repositionAllProtestors() {
    this.protestors.forEach((protestor) => protestor.reposition());
  }

  showProtestors(countryId) {
    // Check if protestors are already shown
    if (this.protestors.has(countryId)) {
      this.hideProtestors(countryId);
    }
    console.log(`sss cid ${countryId}`);

    const hitbox = this.protestorHitboxManager.showHitbox(countryId, this);
    if (!hitbox) return null;

    const gameContainer = this._getGameContainer();
    if (!gameContainer) return null;

    if (this.audioManager) {
      if (countryId === "canada") {
        const region = "westCanada";
        // this.audioManager.play("protestors", region + "Protestors", 0.7);
      } else {
        // this.audioManager.play("protestors", countryId + "Protestors", 0.7);
      }
    }
    // Create protestor with callbacks
    const protestor = new Protestor(countryId, hitbox, gameContainer, this.config, {
      onScoreUpdate: () => this._updateScore(),
      onSupportClick: (id) => this._handleSupportClick(id),
      onPlaySound: (soundType, volume) => {
        if (this.audioManager) {
          if (soundType === "growProtestors") {
            this.audioManager.playGrowProtestorsSound(volume);
          }
        }
      },
      onHide: (id) => this.hideProtestors(id),
      isFirstProtestors: !this.hasShownFirstProtestors

    });

    this.hasShownFirstProtestors = true;


    // Create and store the protestor instance
    const wrapper = protestor.create();
    this.protestors.set(countryId, protestor);

    // Update country state
    this.countries[countryId].protestorsShown = true;

    // this.logger.info("freedom", `Created protestors for ${countryId}`);

    return wrapper;
  }

  // Handle protestor click
  handleProtestorClick(countryId) {
    const protestor = this.protestors.get(countryId);
    if (!protestor) return;

    protestor.handleClick();
  }

  // Update score when protestor is clicked
  _updateScore() {
    let scoreElement = document.getElementById("score");
    scoreElement.classList.add("score-bounce");
    setTimeout(() => {
      scoreElement.classList.remove("score-bounce");
    }, 500);

    this.gameState.score += 5;
    this.gameEngine.systems.ui.updateHUD(this.gameState);
    this.gameEngine.systems.ui.announceForScreenReaders(`Protestor supported! +5 points. Total score: ${this.gameState.score}`);
  }

  // Handle a support click on protestor
  _handleSupportClick(countryId) {
    if (countryId === "usa") {
      if (this.gameEngine.systems.freedom) {
        this.gameEngine.systems.freedom.handleUSASupportClick();
      }
    } else {
      if (this.gameEngine.systems.freedom) {
        this.gameEngine.systems.freedom.applyCountrySupport(countryId);
      }
    }
  }

  // Hide protestors for a country
  hideProtestors(countryId) {
    const protestor = this.protestors.get(countryId);
    if (!protestor) return;


    // Clean up the protestor instance
    protestor.cleanup();
    this.protestors.delete(countryId);

    // Hide hitbox
    if (this.protestorHitboxManager) {
      this.protestorHitboxManager.hideProtestorHitbox(countryId);
    }

    // Update country state
    if (this.countries[countryId]) {
      this.countries[countryId].protestorsShown = false;
    }

    // Schedule next appearance
    setTimeout(() => {
      this._scheduleProtestors(countryId);
    }, 200);

    // this.logger.info("freedom", `Removed protestors for ${countryId}`);
  }

  // Clean up all protestors
  cleanupAllProtestors() {
    // Clear all timers
    for (const timerId of this.protestorTimers.values()) {
      clearTimeout(timerId);
    }
    this.protestorTimers.clear();

    // Clean up each protestor instance
    for (const [countryId, protestor] of this.protestors.entries()) {
      protestor.cleanup();

      // Hide hitbox
      if (this.protestorHitboxManager) {
        this.protestorHitboxManager.hideProtestorHitbox(countryId);
      }

      // Update country state
      if (this.countries[countryId]) {
        this.countries[countryId].protestorsShown = false;
      }
    }

    // Clear protestors map
    this.protestors.clear();

    // Clean up hitboxes
    if (this.protestorHitboxManager) {
      this.protestorHitboxManager.cleanupAll();
    }

    // this.logger.info("freedom", "All protestors cleaned up");
  }

  // Pause the protestor manager
  pause() {
    // Store current state
    this._pausedState = {
      protestorIds: Array.from(this.protestors.keys()),
    };

    // Hide all protestors without scheduling reappearance
    for (const [countryId, protestor] of this.protestors.entries()) {
      protestor.cleanup();
    }

    // Clear map, track which were active
    this.protestors.clear();

    // Clear timers
    for (const timerId of this.protestorTimers.values()) {
      clearTimeout(timerId);
    }
    this.protestorTimers.clear();
  }

  // Resume the protestor manager
  resume() {
    if (!this._pausedState) return;

    // Restore protestors that were active
    this._pausedState.protestorIds.forEach((countryId) => {
      this._scheduleProtestors(countryId);
    });

    this._pausedState = null;
  }

  // Reset the protestor manager
  reset() {
    // Clean up all protestors
    this.cleanupAllProtestors();

    // Reset USA protestor timing
    this.usaTimingCheckDone = false;

    // Reset all country states
    Object.keys(this.countries).forEach((countryId) => {
      this.countries[countryId] = {
        id: countryId,
        annexTime: 0,
        protestorsShown: false,
        initialDelaySet: false,
        initialDelay: null,
      };
    });

    // Re-initialize protestor hitbox manager
    this._initProtestorHitboxManager();
  }

  // Clean up all resources
  destroy() {
    // Clean up all protestors
    this.cleanupAllProtestors();

    // Clear all timers
    for (const timerId of this.protestorTimers.values()) {
      clearTimeout(timerId);
    }
    this.protestorTimers.clear();

    // Destroy protestor hitbox manager
    if (this.protestorHitboxManager) {
      this.protestorHitboxManager.destroy();
    }
  }
}
