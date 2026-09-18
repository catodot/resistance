
class UIManager {
  constructor() {
    this.elements = {
      screens: {},
      buttons: {},
      hud: {},
      game: {},
      countries: {},
      trump: null,
    };

    this.state = null;
    this.announcer = null;
  }

  /**
   * Initialize the UI manager
   * @param {Document} document - Document object
   */
  init(document) {
    // Get element references
    this._collectElementReferences(document);

    // Create screen reader announcer
    this._createScreenReaderAnnouncer(document);

    // Set up responsive handlers
    this._setupResponsiveHandlers();

    // Add accessibility attributes
    this._addAccessibilityAttributes();

    // Create the announcer for this instance
    this.announceForScreenReaders = this.announceForScreenReaders.bind(this);
  }

  /**
   * Connect to game state
   * @param {GameState} state - Game state reference
   */
  connectState(state) {
    this.state = state;
  }

  /**
   * Show the game screen
   */
  showGameScreen() {
    // Resume audio context for mobile compatibility
    if (this.audio) {
      this.audio.resumeAudioContext();
    } else if (window.audioManager) {
      window.audioManager.resumeAudioContext();
    }
    // Hide intro screen, show game screen
    this.elements.screens.intro.classList.add("hidden");
    this.elements.screens.game.classList.remove("hidden");

    // Create intro animations
    this._animateGameIntro();
  }

  /**
   * Ensure audio is ready to play
   * @returns {Promise} Promise that resolves when audio is ready
   */
  ensureAudioReady() {
    // First try this.audio (from setupManagerAudio)
    if (this.audio && typeof this.audio.resumeAudioContext === "function") {
      return this.audio.resumeAudioContext();
    }
    // Then try global audio manager
    else if (window.audioManager && typeof window.audioManager.resumeAudioContext === "function") {
      return window.audioManager.resumeAudioContext();
    }
    // Fallback - return resolved promise
    return Promise.resolve();
  }

  /**
   * Show game over screen
   * @param {boolean} playerWon - Whether player won
   * @param {GameState} state - Current game state
   */
  showGameOverScreen(playerWon, state) {
    // Ensure audio is set up first
    if (this.audio) {
      this.audio
        .resumeAudioContext()
        .then(() => {
          try {
          } catch (error) {
            console.warn("[UI] Error playing game over sound:", error);
            // Try direct play as fallback
            try {
              this.audio.playDirect("gameOver.mp3", 0.8);
            } catch (e) {
              // Silent fail on fallback
            }
          }
        })
        .catch((e) => {
          console.warn("[UI] Failed to resume audio context for game over:", e);
        });
    } else if (window.audioManager) {
      window.audioManager
        .resumeAudioContext()
        .then(() => {
          try {
            // window.audioManager.play("ui", "gameOver", 0.8);
          } catch (error) {
            console.warn("[UI] Error playing game over sound with global audio:", error);
          }
        })
        .catch((e) => {
          console.warn("[UI] Failed to resume global audio context for game over:", e);
        });
    }
    // Hide game screen, show game over screen
    this.elements.screens.game.classList.add("hidden");
    if (this.elements.screens.gameOver) {
      this.elements.screens.gameOver.classList.remove("hidden");
      this.elements.screens.gameOver.style.display = ""; // Clear inline display style
    }
    // Calculate time statistics
    const totalGameTime = state.config.GAME_DURATION;
    const timeSurvived = totalGameTime - state.timeRemaining;
    const timeDisplay = this._formatTimeSurvived(timeSurvived, totalGameTime);

    // Update game over animation
    this._updateGameOverAnimation(playerWon);

    // Update game over stats
    this._updateGameOverStats(timeDisplay, playerWon, state);

    // Announce result for screen readers
    const announcement = playerWon
      ? "Victory! You successfully defended the neighboring countries!"
      : "Game over. The neighboring countries have been claimed by Trump.";
    this.announceForScreenReaders(announcement);

    // Initialize share buttons if function exists
    if (typeof initializeShareButtonsOnGameOver === "function") {
      initializeShareButtonsOnGameOver();
    }

    // Set up restart button
    const restartButton = document.getElementById("restart-button");
    if (restartButton) {
      // Remove any existing listeners with cloning trick
      const newButton = restartButton.cloneNode(true);
      restartButton.parentNode.replaceChild(newButton, restartButton);

      // Add fresh click handler
      newButton.addEventListener("click", (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("record")) {
          // Recording mode: just reload main page
          window.location.href = window.location.pathname;
        }
        if (window.gameEngine) {
          window.gameEngine.restartGame();
        } else {
          this.restartGame();
        }
      });
    }
  }

  positionElements() {
    // Ensure map is loaded before positioning
    const mapElement = document.getElementById("map-background");
    if (!mapElement || !this.state) return;

    // Get fresh map dimensions
    const mapRect = mapElement.getBoundingClientRect();

    // Update state with map properties
    this.state.mapScale = mapRect.width / mapElement.naturalWidth;
    this.state.mapOffsetX = mapRect.left;
    this.state.mapOffsetY = mapRect.top;

    this.positionCountryFlags();

    // Set CSS custom properties for positioning
    document.documentElement.style.setProperty("--map-width", `${mapRect.width}px`);
    document.documentElement.style.setProperty("--map-height", `${mapRect.height}px`);
    document.documentElement.style.setProperty("--map-top", `${mapRect.top}px`);
    document.documentElement.style.setProperty("--map-left", `${mapRect.left}px`);

    // Position children via CSS variables
    this.positionCountryFlagOverlays();
    this.positionTrumpCharacter();
  }

  positionCountryFlags() {
    if (!this.state || !window.animationManager) return;

    // For each country, reposition its flags
    Object.keys(this.state.countries).forEach((countryId) => {
      const country = this.state.countries[countryId];

      if (country.flags && country.flags.length > 0) {
        const mapElement = document.getElementById("map-background");
        if (!mapElement) return;

        const mapScale = mapElement.clientWidth / mapElement.naturalWidth;
        const mapRect = mapElement.getBoundingClientRect();
        const gameContainer = document.getElementById("game-container");
        if (!gameContainer) return;

        const containerRect = gameContainer.getBoundingClientRect();

        // Update each flag position
        country.flags.forEach((flagInfo, index) => {
          if (flagInfo && flagInfo.element && country.flagPositions[index]) {
            const position = country.flagPositions[index];
            const scaledX = position.x * mapScale + (mapRect.left - containerRect.left);
            const scaledY = position.y * mapScale + (mapRect.top - containerRect.top);

            flagInfo.element.style.left = `${scaledX}px`;
            flagInfo.element.style.top = `${scaledY}px`;
            flagInfo.element.style.width = `${60 * position.scale * mapScale}px`;
            flagInfo.element.style.height = `${40 * position.scale * mapScale}px`;
          }
        });
      }
    });
  }

  showWorldShrinkAnimation(onCompleteCallback, duration = 3000) {
    const gameContainer = this.elements.game.container;
    if (!gameContainer) {
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    const mapElement = this.elements.game.map;
    if (mapElement) {
      mapElement.style.transition = "none";
      mapElement.style.maxWidth = "100%";
      this.positionElements();
    }

    gameContainer.classList.remove("screen-shake", "light-screen-shake", "grab-screen-shake");

    // Prepare game container for animation
    gameContainer.style.transformOrigin = "center center";
    gameContainer.style.transition = `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${duration}ms ease-out, rotate ${duration}ms linear`;

    void gameContainer.offsetWidth;

    gameContainer.style.transform = "scale(0.1) rotate(360deg)"; // Two full rotations (360 * 2)
    gameContainer.style.opacity = "0";

    // Execute callback after animation
    setTimeout(() => {
      gameContainer.style.display = "none";
      if (onCompleteCallback) onCompleteCallback();
    }, duration);
  }

  shrinkTrumpToNothing(onCompleteCallback, duration = 1200) {
    const trumpContainer = this.elements.trump.container;
    if (!trumpContainer) {
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    trumpContainer.style.transformOrigin = "center center";
    trumpContainer.style.transition = `transform ${duration}ms cubic-bezier(0.55, 0, 0.85, 0), opacity ${duration}ms ease-in`;

    setTimeout(() => {
      trumpContainer.style.transform = "scale(0)";
      trumpContainer.style.opacity = "0";

      setTimeout(() => {
        if (onCompleteCallback) onCompleteCallback();
      }, duration);
    }, 50);
  }
  positionCountryFlagOverlays() {
    const countryFlags = Object.keys(this.elements.countries);

    countryFlags.forEach((country) => {
      const flagOverlay = this.elements.countries[country];
      if (!flagOverlay) return;

      // Add positioning class
      flagOverlay.classList.add("positioned-flag-overlay");

      // Add accessibility attributes
      flagOverlay.setAttribute("role", "img");
      flagOverlay.setAttribute("aria-label", `${country.charAt(0).toUpperCase() + country.slice(1)} flag overlay`);

      // Use CSS variables instead of direct positioning
      flagOverlay.style.position = "absolute";
      flagOverlay.style.top = "var(--map-top)";
      flagOverlay.style.left = "var(--map-left)";
      flagOverlay.style.width = "var(--map-width)";
      flagOverlay.style.height = "var(--map-height)";
    });
  }

  positionTrumpCharacter() {
    if (!this.elements.trump) return;

    const trumpContainer = this.elements.trump.container;
    const trumpSprite = this.elements.trump.sprite;

    if (!trumpContainer || !trumpSprite) return;

    // Use CSS variables for consistent positioning
    trumpContainer.style.position = "absolute";
    trumpContainer.style.top = "var(--map-top)";
    trumpContainer.style.left = "var(--map-left)";
    trumpContainer.style.width = "var(--map-width)";
    trumpContainer.style.height = "var(--map-height)";

    // Configure sprite appearance
    trumpSprite.style.width = "100%";
    trumpSprite.style.height = "100%";
    trumpSprite.style.backgroundSize = "auto 100%";
    trumpSprite.style.position = "absolute";
    trumpSprite.style.top = "0";
  }

  /**
   * Update the game HUD
   * @param {GameState} state - Game state
   */
  updateHUD(state) {
    if (this.elements.hud.score) {
      this.elements.hud.score.textContent = state.score;
    }
  }

  /**
   * Update the progress bar
   * @param {number} timeRemaining - Remaining time
   * @param {number} totalTime - Total game time
   */
  updateProgressBar(timeRemaining, totalTime) {
    const progressPercentage = ((totalTime - timeRemaining) / totalTime) * 100;

    const progressBar = document.getElementById("term-progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;

      // Update ARIA attributes for accessibility
      const progressContainer = document.getElementById("term-progress-container");
      if (progressContainer) {
        progressContainer.setAttribute("aria-valuenow", timeRemaining);
      }
    }

    // Update label text based on progress
    const progressLabel = document.getElementById("term-progress-label");
    if (progressLabel) {
      const yearsRemaining = Math.ceil((timeRemaining / totalTime) * 1461);
      progressLabel.textContent = `${yearsRemaining} ${yearsRemaining === 1 ? "YEAR" : "DAYS TO GO"}`;
    }
  }

  /**
   * Update pause button appearance and accessibility
   * @param {boolean} isPaused - Whether game is paused
   */
  updatePauseButton(isPaused) {
    const pauseButton = document.getElementById("pause-button");
    if (!pauseButton) return;

    pauseButton.setAttribute("aria-pressed", isPaused ? "true" : "false");
    pauseButton.setAttribute("aria-label", isPaused ? "Resume game" : "Pause game");

    const icon = pauseButton.querySelector(".icon");
    if (icon) {
      icon.textContent = isPaused ? "▶️" : "⏸️";
    }
  }

  createPauseOverlay() {
    const pauseOverlay = document.createElement("div");
    pauseOverlay.id = "pause-overlay";
    pauseOverlay.innerHTML = '<div class="pause-overlay-message">Game Paused</div>';
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.appendChild(pauseOverlay);
    }
  }

  /**
   * Remove pause overlay
   */
  removePauseOverlay() {
    const pauseOverlay = document.getElementById("pause-overlay");
    if (pauseOverlay) {
      pauseOverlay.remove();
    }
  }

  /**
   * Clean up grab visuals
   */
  cleanupGrabVisuals() {
    const visual = document.getElementById("trump-hand-visual");
    const hitbox = document.getElementById("trump-hand-hitbox");

    // Remove first-time help
    const helpText = document.getElementById("first-block-help-text");
    if (helpText) helpText.remove();

    const pulseStyle = document.getElementById("first-block-pulse");
    if (pulseStyle) pulseStyle.remove();

    // Clean up visual elements
    if (visual) {
      visual.classList.remove("hittable", "first-block-help");
      visual.style.display = "none";
      visual.style.opacity = "0";
    }

    if (hitbox) {
      hitbox.classList.remove("hittable", "first-block-help");
    }

    // Remove target highlights
    document.querySelectorAll(".target-area.highlighted").forEach((el) => {
      el.classList.remove("highlighted");
    });
  }

  /**
   * @param {string} country - Country to update
   * @param {number} claimCount - Number of claims
   */
  updateFlagOverlay(country, claimCount) {
    const flagOverlay = document.getElementById(`${country}-flag-overlay`);
    if (!flagOverlay) return;

    // Remove previous opacity classes
    flagOverlay.classList.remove("opacity-33", "opacity-66", "opacity-100");

    if (claimCount === 1) {
      flagOverlay.classList.add("opacity-33");
    } else if (claimCount === 2) {
      flagOverlay.classList.add("opacity-66");
    } else if (claimCount === 3) {
      flagOverlay.classList.add("opacity-100");
    }
  }

  /**
   * Announce message for screen readers
   * @param {string} message - Message to announce
   */
  announceForScreenReaders(message) {
    const announcer = document.getElementById("game-announcements");
    if (announcer) {
      announcer.textContent = message;
    }
  }

  resetAllElements() {
    // Reset all country flag overlays
    Object.keys(this.elements.countries).forEach((country) => {
      const flag = this.elements.countries[country];
      if (flag) {
        flag.classList.remove("opacity-33", "opacity-66", "opacity-100", "resistance-possible", "targeting-pulse");
        flag.style.opacity = "";
        flag.style.transform = "";
        flag.style.transition = "";
      }
    });

    this._cleanupFlags();

    const existingIntroWrapper = document.querySelector(".world-intro-animation");
    if (existingIntroWrapper && existingIntroWrapper.parentNode) {
      existingIntroWrapper.parentNode.removeChild(existingIntroWrapper);
    }

    if (this.elements.game.map) {
      // Reset and make visible for restart
      this.elements.game.map.style.transition = "";
      this.elements.game.map.style.opacity = "1"; // Change from "0" to "1"
    }

    // Clear any residual visual effects
    document.querySelectorAll(".screen-shake, .grab-screen-shake").forEach((el) => {
      el.classList.remove("screen-shake", "grab-screen-shake");
    });

    // Clear the game announcer
    const announcer = document.getElementById("game-announcements");
    if (announcer) {
      announcer.textContent = "";
    }

    // Clean up any lingering notification elements
    document.querySelectorAll(".speed-notification, .freedom-flash, .freedom-text, .freedom-confetti, .freedom-firework").forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    // Force update all element positions
    this.positionElements();
  }

  /**
   * Collect references to DOM elements
   * @private
   * @param {Document} document - Document object
   */
  _collectElementReferences(document) {
    // Screen elements
    this.elements.screens = {
      intro: document.getElementById("intro-screen"),
      game: document.getElementById("game-screen"),
      gameOver: document.getElementById("game-over-screen"),
    };

    // Button elements
    this.elements.buttons = {
      start: document.getElementById("start-button"),
      restart: document.getElementById("restart-button"),
    };

    // HUD elements
    this.elements.hud = {
      time: document.getElementById("time-value"),
      score: document.getElementById("score-value"),
      finalScore: document.getElementById("final-score"),
      result: document.getElementById("game-result"),
      message: document.getElementById("game-message"),
      stats: {
        blocks: document.getElementById("blocks-stat"),
        defended: document.getElementById("defended-stat"),
        time: document.getElementById("time-stat"),
      },
    };

    // Game container elements
    this.elements.game = {
      container: document.getElementById("game-container"),
      map: document.getElementById("map-background"),
    };

    // Country elements
    this.elements.countries = {
      usa: document.getElementById("usa-flag-overlay"),
      canada: document.getElementById("canada-flag-overlay"),
      mexico: document.getElementById("mexico-flag-overlay"),
      greenland: document.getElementById("greenland-flag-overlay"),
    };

    // Trump elements
    this.elements.trump = this._createTrumpReferences(document);
  }

  /**
   * Create references to Trump-related elements
   * @private
   * @param {Document} document - Document object
   * @returns {Object} Trump element references
   */
  _createTrumpReferences(document) {
    return {
      container: document.getElementById("trump-sprite-container"),
      sprite: document.getElementById("trump-sprite"),
      hand: document.getElementById("trump-hand-hitbox"),
    };
  }

  /**
   * Create screen reader announcer element
   * @private
   * @param {Document} document - Document object
   */
  _createScreenReaderAnnouncer(document) {
    if (!document.getElementById("game-announcements")) {
      const announcer = document.createElement("div");
      announcer.id = "game-announcements";
      announcer.className = "sr-only";
      announcer.setAttribute("aria-live", "assertive");
      announcer.setAttribute("role", "log");
      document.body.appendChild(announcer);
    }
  }

  _setupResponsiveHandlers() {
    // Window resize handler with debounce for performance
    let resizeTimeout;
    window.addEventListener("resize", () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Debounce repositioning during resize
      resizeTimeout = setTimeout(() => {
        if (this.state && this.state.isPlaying) {
          this._updateMapDimensions();

          // Then reposition all elements
          this.positionElements();
        }

        // Reposition flags even if not playing
        this.positionCountryFlagOverlays();

        // Reposition protestor hitboxes if the manager exists
        if (window.protestorHitboxManager) {
          window.protestorHitboxManager.repositionAllHitboxes();
        }


        // Log resize for debugging
        console.log("Window resized, elements repositioned");
      }, 150); // 150ms debounce time
    });

    // Orientation change handler for mobile
    window.addEventListener("orientationchange", () => {
      // Orientation changes need a slightly longer delay
      setTimeout(() => {
        // Update CSS variables with new map dimensions
        this._updateMapDimensions();

        // Reposition all elements
        this.positionElements();

        // Reposition protestor hitboxes
        if (window.protestorHitboxManager) {
          window.protestorHitboxManager.repositionAllHitboxes();
        }

        // Log orientation change for debugging
        console.log("Orientation changed, elements repositioned");
      }, 300);
    });

  }

  // Update map dimension CSS variables
  _updateMapDimensions() {
    const mapElement = document.getElementById("map-background");
    if (!mapElement) return;

    // Get fresh map dimensions
    const mapRect = mapElement.getBoundingClientRect();

    if (this.state) {
      this.state.mapScale = mapRect.width / mapElement.naturalWidth;
      this.state.mapOffsetX = mapRect.left;
      this.state.mapOffsetY = mapRect.top;
    }

    // Set CSS custom properties for positioning
    document.documentElement.style.setProperty("--map-width", `${mapRect.width}px`);
    document.documentElement.style.setProperty("--map-height", `${mapRect.height}px`);
    document.documentElement.style.setProperty("--map-top", `${mapRect.top}px`);
    document.documentElement.style.setProperty("--map-left", `${mapRect.left}px`);
  }

  /**
   * Add accessibility attributes to game elements
   * @private
   */
  _addAccessibilityAttributes() {
    // Add screen attributes
    if (this.elements.screens.intro) {
      this.elements.screens.intro.setAttribute("aria-label", "Game introduction screen");
    }

    if (this.elements.screens.game) {
      this.elements.screens.game.setAttribute("aria-label", "Game play area");
    }

    if (this.elements.screens.gameOver) {
      this.elements.screens.gameOver.setAttribute("aria-label", "Game over results");
    }

    // Add Trump-related attributes
    if (this.elements.trump.container) {
      this.elements.trump.container.setAttribute("role", "img");
      this.elements.trump.container.setAttribute("aria-label", "Trump character");
    }

    if (this.elements.trump.sprite) {
      this.elements.trump.sprite.setAttribute("aria-hidden", "true");
    }

    if (this.elements.trump.hand) {
      this.elements.trump.hand.setAttribute("role", "button");
      this.elements.trump.hand.setAttribute("aria-label", "Block Trump's grabbing hand");
    }
  }

  /**
   * Format the time survived for display
   * @private
   * @param {number} timeSurvived - Time survived in seconds
   * @param {number} totalGameTime - Total game time in seconds
   * @returns {string} Formatted time string
   */
  _formatTimeSurvived(timeSurvived, totalGameTime) {
    const totalYears = 4;
    const yearsSurvived = Math.floor((timeSurvived / totalGameTime) * totalYears);
    const monthsSurvived = Math.floor(((timeSurvived / totalGameTime) * totalYears * 12) % 12);

    // Create grammatically correct time display
    let timeDisplay = "";

    if (yearsSurvived > 0) {
      timeDisplay += `${yearsSurvived} ${yearsSurvived === 1 ? "year" : "years"}`;

      if (monthsSurvived > 0) {
        timeDisplay += ` and ${monthsSurvived} ${monthsSurvived === 1 ? "month" : "months"}`;
      }
    } else {
      timeDisplay = `${monthsSurvived} ${monthsSurvived === 1 ? "month" : "months"}`;
    }

    return timeDisplay;
  }

  /**
   * Update game over animation
   * @private
   * @param {boolean} playerWon - Whether player won
   */
  _updateGameOverAnimation(playerWon) {
    const trumpAnimation = document.getElementById("trump-game-over-animation");
    if (!trumpAnimation) return;

    // Remove existing animation classes
    trumpAnimation.classList.remove("trump-victory-animation", "trump-slapped-animation");

    // Add appropriate animation class
    trumpAnimation.classList.add(playerWon ? "trump-slapped-animation" : "trump-victory-animation");
  }

  /**
   * Update game over stats display
   * @private
   * @param {string} timeDisplay - Formatted time survived
   * @param {boolean} playerWon - Whether player won
   * @param {GameState} state - Game state
   */
  _updateGameOverStats(timeDisplay, playerWon, state) {
    // Update score
    if (this.elements.hud.finalScore) {
      this.elements.hud.finalScore.textContent = state.score;
    }

    // Format blocks text
    const blocks = state.stats.successfulBlocks;
    const blocksText = `${blocks} ${blocks === 1 ? "attack" : "attacks"}`;

    // Update stats text
    if (this.elements.hud.stats.blocks) {
      const statsTextElement = document.querySelector(".stats-text.game-over-stat-value");
      if (statsTextElement) {
        statsTextElement.innerHTML = `YOU BLOCKED <span id="blocks-stat">${blocksText}</span> AND SURVIVED <span id="time-stat">${timeDisplay}</span>`;
      } else {
        // Fallback if element structure is different
        this.elements.hud.stats.blocks.textContent = blocksText;
        if (this.elements.hud.stats.time) {
          this.elements.hud.stats.time.textContent = timeDisplay;
        }
      }
    }

    // Update result and message
    if (this.elements.hud.result) {
      this.elements.hud.result.textContent = playerWon ? "Victory!" : "Game Over";
    }

    if (this.elements.hud.message) {
      this.elements.hud.message.innerHTML = playerWon
        ? "You successfully defended the neighboring countries from annexation! Together we will prevail."
        : "The neighboring countries have been claimed.<br><br>Alone we fail. Together we'd be unstoppable.";
    }
  }

  _animateGameIntro() {
    // Get Trump elements
    const trumpContainer = document.getElementById("trump-sprite-container");

    // Hide Trump elements initially
    if (trumpContainer) {
      trumpContainer.style.visibility = "hidden";
    }

    // Create animation styles if not present
    if (!document.getElementById("game-intro-animations")) {
      const style = document.createElement("style");
      style.id = "game-intro-animations";
      style.textContent = `
        @keyframes world-grow {
          0% { transform: translate(-50%, -50%) scale(0.2) rotate(-360deg); opacity: 0.2; }
          40% { transform: translate(-50%, -50%) scale(0.9) rotate(-60deg); opacity: 0.5; }
          80% { transform: translate(-50%, -50%) scale(1.02) rotate(8deg); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        .world-intro-animation {
          animation: world-grow 3s ease-out forwards;
          transform-origin: center center;
        }
        
        @keyframes trump-entrance {
          0% { transform: translateY(100%) scale(0.5); opacity: 0; }
          40% { transform: translateY(10%) scale(0.9); opacity: 0.8; }
          70% { transform: translateY(0) scale(1.05); opacity: 1; }
          85% { transform: translateY(0) scale(0.95); opacity: 1; }
          100% { transform: translateY(0) scale(1.0); opacity: 1; }
        }
        .trump-entrance-animation {
          animation: trump-entrance 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;  /* Reduced from 2.5s to 1.5s */
          transform-origin: center bottom;
        }
      `;
      document.head.appendChild(style);
    }

    const animatedMap = document.createElement("img");
    animatedMap.draggable = false;
    animatedMap.style.position = "absolute";
    animatedMap.style.left = "50%";
    animatedMap.style.top = "50%";
    animatedMap.style.maxWidth = "130%";
    animatedMap.style.maxHeight = "100vh";
    animatedMap.style.aspectRatio = "1 / 1";
    animatedMap.style.pointerEvents = "none";
    animatedMap.style.zIndex = "1";
    animatedMap.classList.add("world-intro-animation");

    if (this.elements.game.map) {
      animatedMap.src = this.elements.game.map.src;
    }

    if (this.elements.game.container) {
      this.elements.game.container.appendChild(animatedMap);
    }

    // Hide the actual map during animation
    if (this.elements.game.map) {
      this.elements.game.map.style.opacity = "0";
    }

    setTimeout(() => {
      // Ensure audio is ready for animation sounds
      this.ensureAudioReady().then(() => {
        if (trumpContainer) {
          trumpContainer.style.visibility = "visible";
          trumpContainer.classList.add("trump-entrance-animation");
        }
      });

      setTimeout(() => {
        // Fade out globe animation gradually
        if (animatedMap) {
          animatedMap.style.transition = "opacity 0.8s ease-out";
          animatedMap.style.opacity = "0";

          // Remove only after transition completes
          setTimeout(() => {
            if (animatedMap && animatedMap.parentNode) {
              animatedMap.parentNode.removeChild(animatedMap);
            }
          }, 800);
        }

        // Show map gradually
        if (this.elements.game.map) {
          this.elements.game.map.style.transition = "opacity 0.8s ease-in";
          this.elements.game.map.style.opacity = "1";
        }
      }, 2200);
    }, 800);

    // Complete Trump entrance
    setTimeout(() => {
      if (trumpContainer) {
        trumpContainer.classList.remove("trump-entrance-animation");
      }

      // Show all Trump elements
      this._setTrumpVisibility(true);

      // Set idle animation
      if (window.animationManager) {
        window.animationManager.changeState("idle");
      }
    }, 3400); // Reduced from 5500 to 3500
  }

  /**
   * Set Trump elements visibility
   * @private
   * @param {boolean} isVisible - Whether elements should be visible
   */
  _setTrumpVisibility(isVisible) {
    const trumpContainer = document.getElementById("trump-sprite-container");
    const trumpHandVisual = document.getElementById("trump-hand-visual");
    const trumpHandHitbox = document.getElementById("trump-hand-hitbox");

    const visibility = isVisible ? "visible" : "hidden";
    const pointerEvents = isVisible ? "auto" : "none";

    if (trumpContainer) trumpContainer.style.visibility = visibility;
    if (trumpHandVisual) trumpHandVisual.style.visibility = visibility;
    if (trumpHandHitbox) {
      trumpHandHitbox.style.visibility = visibility;
      trumpHandHitbox.style.pointerEvents = pointerEvents;
    }
  }

  _cleanupFlags() {
    // Remove flag elements from DOM
    document.querySelectorAll(".trump-flag-animation").forEach((flag) => {
      if (flag.parentNode) {
        flag.parentNode.removeChild(flag);
      }
    });

    // Clear flag references in state
    if (this.state && this.state.countries) {
      Object.keys(this.state.countries).forEach((countryId) => {
        if (this.state.countries[countryId]) {
          this.state.countries[countryId].flags = [];
        }
      });
    }

    // Call animator's cleanup if it exists
    if (window.animationManager && typeof window.animationManager.removeAllFlags === "function") {
      window.animationManager.removeAllFlags();
    }
  }
}

window.UIManager = UIManager;
