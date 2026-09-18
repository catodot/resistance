class GameState {
  constructor(config) {
    this.config = config;
    this.gameEngine = null; // Initialize as null

    this.reset();
  }

  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine;
  }
  /**
   * Reset state to initial values
   */
  reset() {
    // Core state flags
    this.isPlaying = false;
    this.isPaused = false;
    this.isPlayingAnimationSequence = false;

    // Game progress
    this.score = 0;
    this.timeRemaining = this.config.GAME_DURATION;
    this.gameSpeedMultiplier = 1.0;
    this.countdownTimer = null;
    this.currentTarget = null;
    this.lastGrabTarget = null;
    this.consecutiveHits = 0;

    // Grab state
    this.isEastCanadaGrab = false;
    this.isWestCanadaGrab = false;

    // Animation state
    this.currentAnimationFrame = null;
    this.lastFrameTime = 0;

    // Map state
    this.mapScale = 1.0;
    this.mapOffsetX = 0;
    this.mapOffsetY = 0;

    // Statistics
    this.stats = {
      successfulBlocks: 0,
      countriesDefended: 0,
    };

    // Reset countries
    this.countries = this._createInitialCountryState();

    // Set up animation targets
    this.countryAnimations = {
      canada: ["grabEastCanada", "grabWestCanada"],
      mexico: ["grabMexico"],
      greenland: ["grabGreenland"],
    };
  }

  /**
   * Create initial country state
   * @private
   * @returns {Object} Initial country state
   */
  _createInitialCountryState() {
    const countries = {};

    if (this.config.COUNTRIES) {
      this.config.COUNTRIES.forEach((country) => {
        countries[country] = {
          claims: 0,
          maxClaims: 3, // Default max claims
          flagPositions: this._getFlagPositionsForCountry(country), // Get flag positions
          flags: [], // Initialize the flags array
        };
      });
    }

    return countries;
  }

  _getFlagPositionsForCountry(country) {
    const positions = {
      canada: [
        { x: 650, y: 1100, scale: 0.7 }, // Western Canada
        { x: 950, y: 1300, scale: 0.7 }, // Central Canada
        { x: 1300, y: 1400, scale: 0.7 }, // Eastern Canada
      ],
      westCanada: [
        { x: 650, y: 1100, scale: 0.7 }, // Western Canada
        { x: 680, y: 1200, scale: 0.7 }, // Western Canada
        { x: 690, y: 1250, scale: 0.7 }, // Western Canada
      ],
      eastCanada: [
        { x: 1400, y: 1300, scale: 0.7 }, // Eastern Canada
        { x: 1500, y: 1300, scale: 0.7 }, // Central Canada
        { x: 1300, y: 1400, scale: 0.7 }, // Eastern Canada
      ],
      mexico: [
        { x: 1350, y: 2670, scale: 0.7 },
        { x: 1110, y: 2590, scale: 0.7 },
        { x: 1400, y: 2650, scale: 0.7 },
      ],
      greenland: [
        { x: 2000, y: 400, scale: 0.7 },
        { x: 2200, y: 600, scale: 0.7 },
        { x: 2400, y: 800, scale: 0.7 },
      ],
    };

    return positions[country] || [];
  }
}
