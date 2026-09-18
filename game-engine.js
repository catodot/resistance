class GameEngine {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      DEBUG_MODE: config.debug || false,
      GAME_DURATION: 168, // 2min 48sec in seconds
      AUTO_RESTART_DELAY: 100,
      INITIAL_GRAB_DELAY: 4000,
      COUNTRIES: ["canada", "mexico", "greenland"],
    };

    this.END_STATES = {
      TRUMP_VICTORY: "trump_victory",
      RESISTANCE_WIN: "resistance_win",
      TRUMP_DESTROYED: "trump_destroyed",
    };

    this.endGameSequences = {
      trump_victory: {
        trumpAnimation: "victory",
        audioSequence: ["beenVeryNiceToYou", "lose"],
        message: "But the resistance never dies",
        playerWon: false,
      },
      resistance_win: {
        trumpAnimation: "slapped",
        audioSequence: ["fourYears", "win"],
        message: "ELECTION TIME! right? right???",
        playerWon: true,
      },
      trump_destroyed: {
        trumpAnimation: "slapped",
        audioSequence: ["beenVeryNiceToYou", "win"],
        message: "Honey, you shrunk that junky lunk! ♡♡♡ Next up, land back?",
        playerWon: true,
      },
    };

    // Override with provided config
    Object.assign(this.config, config);

    // Core systems
    this.systems = {
      state: new GameState(this.config),
      ui: new UIManager(),
      input: new InputManager(),
      audio: null,
      animation: null,
      freedom: null,
      collision: null,
    };

    // Resource tracking for cleanup
    this.resources = {
      timeouts: [],
      intervals: [],
      animationFrames: [],
    };

    // Bind critical methods
    this._bindMethods();
  }
  /**
   * Initialize game systems
   * @private
   */
  _initializeGameSystems() {
    // Initialize global logger
    if (!window.logger) {
      window.logger = {
        debug: (category, message) => this.config.DEBUG_MODE && console.debug(`[${category}]`, message),
        info: (category, message) => console.info(`[${category}]`, message),
        warn: (category, message) => console.warn(`[${category}]`, message),
        error: (category, message) => console.error(`[${category}]`, message),
        trace: (category, message) => this.config.DEBUG_MODE && console.trace(`[${category}]`, message),
      };
    }

    if (!this.systems.audio && typeof AudioManager === "function") {
      // Reuse existing instance, or create one
      this.systems.audio = window.audioManager || new AudioManager();

      // Update global reference (for backward compatibility)
      window.audioManager = this.systems.audio;
    }

    // Initialize device utils if needed
    if (!window.DeviceUtils) {
      window.DeviceUtils = {
        isMobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
        viewportWidth: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        viewportHeight: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
      };

      window.addEventListener("resize", () => {
        window.DeviceUtils.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        window.DeviceUtils.viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      });
    }

    // Initialize UI and input systems
    this.systems.ui.init(document);
    this.systems.input.init(document, {
      onStartKey: this.startGame,
    });

    // Initialize remaining input handlers
    this.systems.input.addHandlers({
      onSpaceKey: this.stopGrab,
      onPauseKey: this.togglePause,
    });

    // Initialize animation system
    if (typeof AnimationManager === "function" && !this.systems.animation) {
      this.systems.animation = window.animationManager || new AnimationManager();
      this.systems.animation.setDebugMode(this.config.DEBUG_MODE);
      this.systems.animation.init();
      window.animationManager = this.systems.animation;
    }

    // Set up additional managers
    this._setupAdditionalManagers();

    // Register global access point
    window.gameEngine = this;
    window.gameManager = this;
  }

  init() {
    // Initialize all systems first
    this._initializeGameSystems();

    // Connect systems
    this._connectSystems();

    if (this.config.DEBUG_MODE) {
      this._initDebug();
    }

    // Register global access point
    window.gameEngine = this;
    window.gameManager = this; // For backward compatibility

    // Add visibility change handler
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.systems.state.isPlaying && !this.systems.state.isPaused) {
          this.systems.state.autopaused = true;

          if (this.systems.state.currentTarget) {
            console.log("Tab change detected during grab - forcing grab completion");
            this.grabSuccess(this.systems.state.currentTarget);
          }

          // Use the existing pause functionality
          this.togglePause();

          // Pause audio to avoid background-tab sound
          if (this.systems.audio) {
            this.systems.audio.pauseAll();
          }
        }
      } else {
        // Resume only if auto-paused by visibility change
        if (this.systems.state.isPlaying && this.systems.state.isPaused && this.systems.state.autopaused) {
          // Remove auto-pause flag
          this.systems.state.autopaused = false;

          // Resume the game
          this.togglePause();
        }
      }
    });

    return this;
  }

  _prepareAudio() {
    // Make sure we have an audio system
    if (!this.systems.audio) {
      console.error("[Engine] AudioManager not initialized. Make sure _initializeGameSystems() is called first.");
      return;
    }

    // Unlock audio for mobile
    this.systems.audio.unlock().then((unlocked) => {
      // Start background music with a delay
      this.createTrackedTimeout(() => {
        if (this.systems.audio) {
          this.systems.audio.startBackgroundMusic();
        }
      }, 1000);
    });
  }

  startGame() {
    // console.log("[Engine] Starting new game");

    // Must run in response to user interaction
    this._prepareAudio();

    if (this.systems.audio) {
      // Ensure context ready, then play start sound
      this.systems.audio
        .resumeAudioContext()
        .then(() => {
          try {
            this.systems.audio.play("ui", "gameStart");
          } catch (error) {
            console.warn("[Engine] Failed to play game start sound:", error);
            // Fallback: play directly for critical feedback
            this.systems.audio.playDirect("gameStart.mp3", 0.8);
          }
        })
        .catch((e) => {
          console.warn("[Engine] Failed to resume audio context at game start:", e);
        });
    }

    // Show game screen and setup UI
    this.systems.ui.showGameScreen();
    this.systems.ui.positionElements();

    const mapBackground = document.getElementById("map-background");
    if (mapBackground) {
      mapBackground.addEventListener("click", this.handleGlobeClick);
    }

    // Start game loop
    this._startGameLoop();

    // Start speed progression
    if (window.speedManager) {
      window.speedManager.startSpeedProgression();
    }

    // Schedule first grab after delay
    this.createTrackedTimeout(() => {
      this.initiateGrab();
    }, this.config.INITIAL_GRAB_DELAY);
  }

  /**
   * Create overlay with end game message
   * @private
   * @param {string} message - End game message to display
   * @returns {HTMLElement} The created overlay element
   */
  _createEndOverlay(message, fadeInDelay = 3500) {
    const overlay = document.createElement("div");
    overlay.className = "end-game-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    // overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 1s ease-in-out";

    const messageElement = document.createElement("div");
    messageElement.className = "end-game-message";
    messageElement.innerHTML = message.replace(/\n/g, "<br>");
    messageElement.style.textAlign = "center";

    overlay.appendChild(messageElement);
    document.body.appendChild(overlay);

    // Fade in after a short delay
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, fadeInDelay);

    return overlay;
  }

  /**
   * @private
   */
  _playVictoryBurst() {
    const effects = this.systems.freedom?.visualEffectsManager;
    const gameContainer = document.getElementById("game-container");
    const trumpContainer = document.getElementById("trump-sprite-container");
    if (!effects || !gameContainer || window.DEBUG_DISABLE.particles) return;

    const containerRect = gameContainer.getBoundingClientRect();
    const rect = trumpContainer
      ? trumpContainer.getBoundingClientRect()
      : { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height };

    effects.createConfettiBurst(rect.left - containerRect.left, rect.top - containerRect.top, rect.width, rect.height, gameContainer);
    effects.createFireworkBurst(rect.left - containerRect.left, rect.top - containerRect.top, rect.width, rect.height, gameContainer);
  }

  makeAllCountriesLostAnnouncement() {
    // Get the speed manager for announcements
    if (window.speedManager) {
      const announcementText = "ALL COUNTRIES LOST!";
      window.speedManager.showNotification(announcementText);
    }
  }

  triggerGameEnd(endState, endReason = "unspecified") {
    // Guard against multiple calls
    if (this.systems.state.gameEnding) {
      console.warn(`[EndGame] Game ending already in progress, ignoring call with endState: ${endState}`);
      return false;
    }

    const trumpHandVisual = document.getElementById("trump-hand-visual");
    if (trumpHandVisual) {
      trumpHandVisual.style.opacity = "0";
      // trumpHandVisual.style.display = "none";
    }

    this._cleanupAllFlags();

    // Set flags to prevent multiple calls
    this.systems.state.gameEnding = true;
    this.systems.state.endReason = endReason;
    this.systems.state.isPlaying = false;

    if (window.speedManager) {
      window.speedManager.stopSpeedProgression();
    }

    if (endState === this.END_STATES.TRUMP_VICTORY && endReason === "all_countries_claimed") {
      this.makeAllCountriesLostAnnouncement();
    }

    // Validate and get end sequence
    if (!this.endGameSequences[endState]) {
      console.error(`[EndGame] Invalid end state: ${endState}`);
      endState = this.END_STATES.TRUMP_VICTORY; // Default to trump victory
    }
    const sequence = this.endGameSequences[endState];
    try {
      if (window.UFOManager) {
        window.UFOManager.state.autoSpawnEnabled = false;
        window.UFOManager.destroy();
      }

      if (this.systems.freedom) {
        this.systems.freedom.pause(); // Use pause instead of destroy
      }

      // Stop game loop
      this._stopGameLoop();

      // Clean up resources
      this._cleanupResources();

      if (this.systems.animation) {
        try {
          // Check if the animation state exists
          if (this.systems.animation.animations && this.systems.animation.animations[sequence.trumpAnimation]) {
            this.systems.animation.changeState(sequence.trumpAnimation);
          } else {
            console.warn(`Animation state "${sequence.trumpAnimation}" not found, using fallback`);
            // Use a fallback animation that definitely exists
            this.systems.animation.changeState("idle");
          }
        } catch (e) {
          console.error("Error changing animation state:", e);
        }
      }

      const overlay = this._createEndOverlay(sequence.message, sequence.playerWon ? 4700 : 3500);

      // Loss: no delay, world stays put
      const preSpinDelay = sequence.playerWon ? 2500 : 0;
      setTimeout(() => {
        this._playEndGameSounds(sequence);
        this.systems.audio.fullReset();

        const finishSequence = () => {
          if (overlay) {
            overlay.style.transition = "opacity 0.8s ease-out";
            overlay.style.opacity = "0";

            // Fade out, remove overlay, show game over
            setTimeout(() => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
              this._showFullGameOverScreen(sequence.playerWon);
            }, 1100);
          } else {
            // If overlay's gone, just show game over
            this._showFullGameOverScreen(sequence.playerWon);
          }
        };

        if (sequence.playerWon) {
          this._playVictoryBurst();
          this.systems.ui.shrinkTrumpToNothing(() => {
            this.systems.ui.showWorldShrinkAnimation(finishSequence, 6000);
          }, 1200);
        } else {
          // We lost - the world spins away
          this.systems.ui.showWorldShrinkAnimation(finishSequence, 6000);
        }
      }, preSpinDelay);

      return true;
    } catch (error) {
      // Reset ending state if something goes wrong
      console.error("Fatal error in triggerGameEnd:", error);
      this.systems.state.gameEnding = false;
      return false;
    }
  }

  _playEndGameSounds(sequence) {
    if (!this.systems.audio) {
      return;
    }

    this.systems.audio.stopAllExceptBackgroundMusic();

    if (this.systems.audio.backgroundMusic) {
      this.systems.audio.fadeTo(this.systems.audio.backgroundMusic, 0, 1000, () => {
        this.systems.audio.stopBackgroundMusic();
      });
    }

    try {
      // Simple, direct sound playing
      // finddme
      if (sequence.audioSequence && sequence.audioSequence.length) {
        sequence.audioSequence.forEach((sound, index) => {
          setTimeout(() => {
            const category = ["beenVeryNiceToYou", "fourYears"].includes(sound) ? "trump" : "ui";
            this.systems.audio.play(category, sound, 0.8);
          }, index * 800); // Stagger sounds slightly
        });
      }
      // this.systems.audio.play("ui", "speedup", 0.6);
    } catch (error) {
      console.error("[EndGame] Error playing end game sounds:", error);
    }
  }

  restartGame() {
    console.log("restart [Engine] Restarting game");

    // FIRST: hide UI elements during restart
    const gameOverScreen = document.getElementById("game-over-screen");
    if (gameOverScreen) {
      gameOverScreen.classList.add("hidden");
      gameOverScreen.style.display = "none"; // Keep this to ensure it's hidden
    }

    this._cleanupAllFlags();

    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      // Clear death-spin transition before it replays
      gameContainer.style.transition = "none";
      gameContainer.style.transform = "scale(1)";
      gameContainer.style.opacity = "1";
      gameContainer.style.display = "block";
    }

    // Force re-setup of hitbox handlers
    this.systems.input._setupHitboxHandlers();

    this._stopGameLoop();
    this._cleanupResources();
    this._resetSystems();

    // Reset all managers
    if (window.speedManager) window.speedManager.reset();
    if (window.trumpHandEffects) window.trumpHandEffects.reset();
    if (window.UFOManager) window.UFOManager.reset();
    if (window.handHitboxManager) window.handHitboxManager.reset();

    if (window.freedomManager) window.freedomManager.reset();

    if (window.protestorHitboxManager) window.protestorHitboxManager.cleanupAll();

    // Reset audio with proper context management
    if (this.systems.audio) {
      this.systems.audio.fullReset();
    }

    // Reset game state
    this.systems.state.reset();

    // Reset UI elements
    this.systems.ui.resetAllElements();

    // Delay slightly so DOM updates first
    setTimeout(() => {
      this.startGame();
    }, 200);

    this.systems.state.gameEnding = false;
    this.systems.state.endReason = null;
  }

  _showFullGameOverScreen(playerWon) {
    console.log("restart _showFullGameOverScreen");

    // Show game over screen
    this.systems.ui.showGameOverScreen(playerWon, this.systems.state);

    // Show voice recorder after a short delay
    setTimeout(() => {
      if (typeof openVoiceRecordingInterface === "function") {
        openVoiceRecordingInterface();
      } else {
        // Fallback: Try to show the modal directly
        const recorderModal = document.getElementById("voice-recorder-modal");
        if (recorderModal) {
          recorderModal.classList.remove("hidden");
          recorderModal.style.display = "flex";
          recorderModal.style.opacity = "1";
          recorderModal.style.visibility = "visible";

          // Initialize voice recorder if needed
          if (!window.voiceRecorder) {
            window.voiceRecorder = new VoiceRecorder();
            window.voiceRecorder.init();
          }
        }
      }
    }, 500);

    // Schedule auto-restart
    if (this.config.AUTO_RESTART_DELAY > 0) {
      console.log("restart this.config.AUTO_RESTART_DELAY > 0");

      this._scheduleAutoRestart();
    }
  }

  initiateGrab() {
    console.log("grabbing");

    // Skip if game isn't actively playing
    if (!this.systems.state.isPlaying) {
      console.log("game state isn't playing");
    
      return;
    }

    if (this.systems.state.isPaused) {
      console.log("game state is paused");
      return;
    }

    if (this._checkGameOverCondition()) {
      this.triggerGameEnd(this.END_STATES.TRUMP_VICTORY, "all_countries_claimed");
      console.log("triggering game end");
      return;
    }

    // Select target country
    const targetCountry = this._selectTargetCountry();
    if (!targetCountry) {
      // Use tracked timeout for retry
      this.createTrackedTimeout(() => {
        this.initiateGrab();
      }, 500);
      return;
    }

    // Select animation for target
    const animationInfo = this._selectAnimationForCountry(targetCountry);

    // Set up grab sequence
    this._prepareGrabSequence(targetCountry, animationInfo);

    if (this.systems.audio) {
      this.systems.audio
        .resumeAudioContext()
        .then(() => {
          try {
            this.systems.audio.playGrabWarning();
            this.systems.audio.playGrabAttempt(targetCountry);
          } catch (error) {
            console.warn("[Engine] Error playing grab audio:", error);
          }
        })
        .catch((e) => {
          console.warn("[Engine] Failed to resume audio context:", e);
        });
    }

    // Start animation sequence
    this._startGrabAnimation(targetCountry, animationInfo.animationName);

    // Fallback timeout in case callback never fires
    this.createTrackedTimeout(() => {
      if (this.systems.state.currentTarget === targetCountry) {
        this.grabSuccess(targetCountry);
      }
    }, 8000);
  }

_showLipsAnimation(country, talkDurationMs) {
  if (!country) return;

  // Reuses positioning logic from the red circle
  const position = this._getLipsPosition(country);
  if (!position) return;

  // Delay matches the protest sound timing
  const gameSpeedMultiplier = this.systems.audio ? this.systems.audio._sanitizeGameSpeed() : 1.0;
  const sobDelay = this.systems.audio ? this.systems.audio.baseDelays.sobToProtest : 0.5;
  const totalDelay = (sobDelay / gameSpeedMultiplier) * 1000; // Convert to milliseconds

  // Wait as long as the protest sound
  setTimeout(() => {
    // Get map scale, same as position calc
    const mapElement = document.getElementById("map-background");
    const mapRect = mapElement.getBoundingClientRect();
    const currentMapScale = mapRect.width / mapElement.naturalWidth;
    
    // Size responsively by device and map scale
    const baseLipsSize = 144; // Your original desktop size (180), reduced 20%
    const isMobile = window.DeviceUtils ? window.DeviceUtils.isMobile() :
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let scaledLipsSize;

    if (isMobile) {
      scaledLipsSize = Math.max(88, baseLipsSize * currentMapScale * 2);
    } else {
      if (currentMapScale < 0.3) {
        scaledLipsSize = Math.max(96, baseLipsSize * currentMapScale * 4); // Boost small desktop scales
      } else {
        scaledLipsSize = Math.max(112, baseLipsSize * currentMapScale * 1.5); // Moderate scaling for normal desktop
      }

      scaledLipsSize = Math.min(200, scaledLipsSize);
    }
    
    // Create the animation container
    const lipsContainer = document.createElement("div");
    lipsContainer.id = "lips-animation";
    
    // Style the container with responsive sizing
    lipsContainer.style.position = "fixed";
    lipsContainer.style.left = `${position.x}px`;
    lipsContainer.style.top = `${position.y}px`;
    lipsContainer.style.transform = "translate(-50%, -50%)";
    lipsContainer.style.width = `${scaledLipsSize}px`;  
    lipsContainer.style.height = `${scaledLipsSize}px`; 
    lipsContainer.style.zIndex = "4";
    lipsContainer.style.pointerEvents = "none";
    
    // Set up the sprite animation
    const spriteSheet = this._getLipsSpriteSheet(country);
    lipsContainer.style.backgroundImage = `url('${spriteSheet}')`;
    lipsContainer.style.backgroundSize = "400% 100%"; // Assuming 4 frames side by side
    lipsContainer.style.backgroundPosition = "0% 0%";
    lipsContainer.style.backgroundRepeat = "no-repeat";
    
    const lipsParent = document.getElementById("game-container") || document.body;
    lipsParent.appendChild(lipsContainer);
    
    // Animate the sprite
    let frame = 0;
    const frameCount = 4; // Adjust based on your actual sprite
    const frameDuration = 100; // milliseconds per frame
    
    const animationInterval = setInterval(() => {
      frame = (frame + 1) % frameCount;
      const percentPosition = (frame / (frameCount - 1)) * 100;
      lipsContainer.style.backgroundPosition = `${percentPosition}% 0%`;
    }, frameDuration);
    
    // Matches the protest clip length
    setTimeout(() => {
      clearInterval(animationInterval);
      if (lipsContainer.parentNode) {
        lipsContainer.parentNode.removeChild(lipsContainer);
      }
    }, talkDurationMs || 1500);
  }, totalDelay);
}


// Gets sprite sheet path for a country
_getLipsSpriteSheet(targetCountry) {
  // Map countries to their lip sprite sheets
  const lipsSprites = {
    westCanada: "images/lips-greenland-sprite.png",
    eastCanada: "images/lips-greenland-sprite.png",
    mexico: "images/lips-mexico-sprite.png",
    greenland: "images/lips-greenland-sprite.png"
  };
  
  return lipsSprites[targetCountry] || "images/lips-default-sprite.png";
}

_getLipsPosition(targetCountry) {
  const mapElement = document.getElementById("map-background");
  const gameContainer = document.getElementById("game-container");
  
  if (!mapElement || !gameContainer) return null;
  
  const mapRect = mapElement.getBoundingClientRect();
  const currentMapScale = mapRect.width / mapElement.naturalWidth;
  
  let x, y;
  
  if (targetCountry === "mexico") {
    const position = { x: 1106, y: 2405, width: 737, height: 737 };
    x = mapRect.left + (position.x * currentMapScale) + (position.width * currentMapScale / 2);
    y = mapRect.top + (position.y * currentMapScale) + (position.height * currentMapScale / 2);
  } else if (targetCountry === "eastCanada") {
    const position = { x: 1708, y: 1499, width: 737, height: 737 };
    x = mapRect.left + (position.x * currentMapScale) + (position.width * currentMapScale / 2);
    y = mapRect.top + (position.y * currentMapScale) + (position.height * currentMapScale / 2);
  } else if (targetCountry === "greenland") {
    const position = { x: 2163, y: 354, width: 737, height: 737 };
    x = mapRect.left + (position.x * currentMapScale) + (position.width * currentMapScale / 2);
    y = mapRect.top + (position.y * currentMapScale) + (position.height * currentMapScale / 2);
  } else if (targetCountry === "westCanada") {
    const position = { x: 336, y: 1368, width: 737, height: 737 };
    x = mapRect.left + (position.x * currentMapScale) + (position.width * currentMapScale / 2);
    y = mapRect.top + (position.y * currentMapScale) + (position.height * currentMapScale / 2);
  } else {
    // Fallback - this shouldn't happen now
    console.warn(`Unknown target country: ${targetCountry}`);
    return null;
  }
  
  return { x, y };
}

  stopGrab(event) {
    const targetCountry = this.systems.state.currentTarget;
    console.log("target country is " + targetCountry);
    
    if (!targetCountry) return;

    // this._showRedCircleTest();


    // Determine specific grab region early
    const smackRegion = this._determineSmackRegion(targetCountry);

    const protestSound = this.systems.audio ? this.systems.audio.pickProtestSound(smackRegion) : null;

    this._showLipsAnimation(smackRegion, protestSound?.durationMs);


    // Handle audio effects
    this._playBlockSound(smackRegion, protestSound?.file);

    // Stop and reset animation
    this._handleAnimationStop();

    // Reset target to prevent double-handling
    this._resetGrabTarget();

    // Apply visual block effects
    this._applyBlockVisualEffects(targetCountry);

    // Update game state
    this._updateScoreAfterBlock();

    // Play block animation sequence
    this._playBlockAnimationSequence(smackRegion);

    // Accessibility and UI cleanup
    this._handlePostBlockUIUpdates(targetCountry);
  }

  // Play block sound with error handling
  _playBlockSound(smackRegion, preSelectedProtestFile = null) {
    if (!this.systems.audio) return;

    try {
      this.systems.audio
        .resumeAudioContext()
        .then(() => {
          try {
            this.systems.audio.playSuccessfulBlock(smackRegion, null, preSelectedProtestFile);
          } catch (error) {
            console.warn("[Engine] Error playing block sound:", error);
            this.systems.audio.playDirect("slap1.mp3", 0.8);
          }
        })
        .catch((error) => {
          console.warn("[Engine] Failed to resume audio context:", error);
        });
    } catch (error) {
      console.warn("[Engine] Audio system error:", error);
    }
  }

  // Handle animation stopping
  _handleAnimationStop() {
    if (!this.systems.animation) return;

    try {
      this.systems.animation.stop();
      this.systems.animation.changeState("idle");
    } catch (e) {
      console.warn("[Engine] Error stopping animation:", e);
    }
  }

  // Apply visual block effects
  _applyBlockVisualEffects(targetCountry) {
    // Prioritize systems reference
    if (this.systems.effects) {
      this.systems.effects.applyHitEffect();
      this.systems.effects.highlightTargetCountry(targetCountry, false);
      this.systems.effects.setNotGrabbingState();
      return;
    }

    // Fall back to global reference
    if (window.trumpHandEffects) {
      console.warn("Falling back to global trumpHandEffects");
      window.trumpHandEffects.applyHitEffect();
      window.trumpHandEffects.highlightTargetCountry(targetCountry, false);
      return;
    }

    // Absolute last resort
    console.warn("No visual effects system available");
  }

  // Handle post-block UI updates
  _handlePostBlockUIUpdates(targetCountry) {
    if (window.handHitboxManager) {
      window.handHitboxManager.hideHandHitbox();
    }
  }

  grabSuccess(country) {
    // Avoid re-triggering shake during spin-away
    if (this.systems.state.gameEnding) return;

    console.log(`[Game] Grab success for ${country}`);

    // Reset consecutive hits
    this.systems.state.consecutiveHits = 0;

    // Apply visual effect, passing east/west Canada
    if (window.trumpHandEffects) {
      window.trumpHandEffects.applyGrabSuccessEffect(country);
    }

    // Resolve country, handling the Canada special case
    const isCanada = country === "eastCanada" || country === "westCanada";
    const targetCountry = isCanada ? "canada" : country;

    // Get current state for the country
    const state = this.systems.state;
    const countryState = state.countries[targetCountry];

    if (!countryState) {
      console.error(`[Game] Country state not found for ${targetCountry}`);
      return;
    }

    // Update claims with bounds checking
    const newClaims = Math.min(countryState.claims + 1, countryState.maxClaims);
    const previousClaims = countryState.claims;
    countryState.claims = newClaims;

    console.log(`[Game] Updated claims for ${targetCountry}: ${countryState.claims}/${countryState.maxClaims}`);

    // Update UI
    this.systems.ui.updateFlagOverlay(targetCountry, countryState.claims);

    // Play appropriate audio and make announcement
    if (isCanada) {
      this._handleCanadaGrab(country);
    } else {
      this._handleStandardCountryGrab(country);
    }

    // ANNOUNCEMENT: Check if country was fully annexed
    if (previousClaims < countryState.maxClaims && newClaims >= countryState.maxClaims) {
      this.makeCountryAnnexationAnnouncement(targetCountry);
    }

    // Check if this is the game-winning grab
    const isGameOver = this._checkGameOverCondition();
    if (isGameOver) {
      console.log("[Game] Game over condition met in grabSuccess");
      this.triggerGameEnd(this.END_STATES.TRUMP_VICTORY, "all_countries_claimed");
      return;
    }

    // Continue game progression if game isn't over
    this._proceedWithGameProgression();
  }

  makeCountryAnnexationAnnouncement(countryId) {
    // Get the speed manager for announcements
    if (window.speedManager) {
      const announcementText = `${countryId.toUpperCase()} LOST!`;
      window.speedManager.showNotification(announcementText);

      // Play country-specific annexation cry
      if (this.systems.audio) {
        this.systems.audio.play("ui", `${countryId}Lost`, 0.8);
      }
    }
  }

  _proceedWithGameProgression() {
    if (this.systems.animation) {
      let proceeded = false;
      const proceed = () => {
        if (proceeded) return;
        proceeded = true;
        this.initiateGrab();
      };

      // Fallback timeout in case callback never fires
      this.createTrackedTimeout(proceed, 3000);

      this.systems.animation.changeState("victory", proceed);
    } else {
      // Fallback if no animation manager
      this.createTrackedTimeout(() => this.initiateGrab(), 1000);
    }
  }

  /**
   * Toggle game pause state
   */
  togglePause() {
    const state = this.systems.state;
    state.isPaused = !state.isPaused;

    // Update UI
    this.systems.ui.updatePauseButton(state.isPaused);

    if (state.isPaused) {
      this._pauseGame();
    } else {
      this._resumeGame();
    }
  }

  /**
   * @param {Function} callback - Function to call when timeout completes
   * @param {number} delay - Delay in milliseconds
   * @returns {number} - Timeout ID
   */
  createTrackedTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      // Remove from tracked timeouts first
      const index = this.resources.timeouts.indexOf(timeoutId);
      if (index !== -1) this.resources.timeouts.splice(index, 1);

      // Then execute callback
      callback();
    }, delay);

    // Track this timeout
    this.resources.timeouts.push(timeoutId);
    return timeoutId;
  }

  /**
   * @param {Function} callback - Function to call on each interval
   * @param {number} delay - Interval delay in milliseconds
   * @returns {number} - Interval ID
   */
  createTrackedInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.resources.intervals.push(intervalId);
    return intervalId;
  }

  // PRIVATE METHODS

  /**
   * Bind class methods to maintain 'this' context
   * @private
   */
  _bindMethods() {
    // Grab/block mechanics
    this.initiateGrab = this.initiateGrab.bind(this);
    this.stopGrab = this.stopGrab.bind(this);
    this.grabSuccess = this.grabSuccess.bind(this);
    this.handleGlobeClick = this.handleGlobeClick.bind(this);

    // Game flow control
    this.togglePause = this.togglePause.bind(this);
    this.startGame = this.startGame.bind(this);
    // this.endGame = this.endGame.bind(this);
    this.restartGame = this.restartGame.bind(this);

    // Resource management
    this.createTrackedTimeout = this.createTrackedTimeout.bind(this);
    this.createTrackedInterval = this.createTrackedInterval.bind(this);

    // Game loop
    this._updateGameFrame = this._updateGameFrame.bind(this);
  }
  _setupAdditionalManagers() {
    // Get the audio manager reference
    const audioManager = this.systems.audio;

    if (typeof HandHitboxManager === "function") {
      if (!window.handHitboxManager) {
        try {
          window.handHitboxManager = new HandHitboxManager(this.systems.audio);
        } catch (error) {
          console.error("Error creating HandHitboxManager:", error);
        }
      }
      this.systems.collision = window.handHitboxManager;
    }

    // Trump hand effects controller
    if (typeof TrumpHandEffectsController === "function" && this.systems.state) {
      if (!window.trumpHandEffects) {
        window.trumpHandEffects = new TrumpHandEffectsController(this.systems.state, audioManager);
      }
      this.systems.effects = window.trumpHandEffects;
    }

    // Protestor hitbox manager
    if (typeof ProtestorHitboxManager === "function") {
      if (!window.protestorHitboxManager) {
        window.protestorHitboxManager = new ProtestorHitboxManager(false, audioManager);
      }
      this.systems.protestorHitbox = window.protestorHitboxManager;
    }

    if (typeof FreedomManager === "function") {
      if (!window.freedomManager) {
        try {
          window.freedomManager = new FreedomManager(
            this.systems.state,
            this.systems.ui.elements,
            this.systems.audio,
            {}, // Default config
            this, // Pass the game engine instance
            this.systems.animation
          );
        } catch (error) {
          console.error("aaa Error creating FreedomManager:", error);
        }
      }
      this.systems.freedom = window.freedomManager;
    }

    if (typeof UFOManager === "function") {
      // console.log("Setting up UFO Manager");

      if (!window.UFOManager) {
        window.UFOManager = new UFOManager(this.systems.audio);
        window.UFOManager.init(this); // Pass the game engine
      }
      this.systems.ufo = window.UFOManager;
    }

    // Speed manager
    if (typeof GameSpeedManager === "function") {
      if (!window.speedManager) {
        window.speedManager = new GameSpeedManager(this.systems.state, this.systems.animation, audioManager);
        window.speedManager.init();
      }
      this.systems.speed = window.speedManager;
    }
  }

  /**
   * Connect systems together
   * @private
   */
  _connectSystems() {
    // Connect UI to state for updates
    this.systems.ui.connectState(this.systems.state);

    // Connect input to game elements
    this.systems.input.connectUI(this.systems.ui);

    this.systems.state.setGameEngine(this);
  }

  /**
   * Initialize debug features
   * @private
   */
  _initDebug() {
    if (typeof DebugManager === "function") {
      // Build UI elements reference from system.ui
      const debugElements = this.systems && this.systems.ui ? this.systems.ui.elements : {};

      const debugManager = new DebugManager(
        debugElements, // Pass existing UI elements or empty object
        this.systems.state,
        this.systems.animation
      );

      window.debugManager = debugManager;
      debugManager.init();

      // Connect audio to debug
      if (this.systems.audio) {
        debugManager.audioManager = this.systems.audio;

        window.testAudio = function (category, name) {
          return debugManager.audioManager?.play(category, name) || "AudioManager not available";
        };
      }
    }
  }

  /**
   * Start the game loop
   * @private
   */
  _startGameLoop() {
    // Set playing state
    this.systems.state.isPlaying = true;

    // Reset timing data
    this.systems.state.lastFrameTime = performance.now();

    // Start countdown timer
    this.systems.state.countdownTimer = this.createTrackedInterval(this._updateCountdown.bind(this), 1000);

    // Start animation loop
    this._requestAnimationFrame();
  }

  /**
   * Stop the game loop
   * @private
   */
  _stopGameLoop() {
    // Cancel animation frame if it exists
    if (this.systems.state.currentAnimationFrame) {
      cancelAnimationFrame(this.systems.state.currentAnimationFrame);
      this.systems.state.currentAnimationFrame = null;
    }

    // Clear countdown timer
    if (this.systems.state.countdownTimer) {
      clearInterval(this.systems.state.countdownTimer);
      this.systems.state.countdownTimer = null;
    }
  }

  /**
   * Removes all tracked event listeners
   */
  _removeTrackedEventListeners() {
    if (!this.resources.eventListeners) return;

    this.resources.eventListeners.forEach(({ element, eventType, handler, useCapture }) => {
      if (element) {
        element.removeEventListener(eventType, handler, useCapture);
      }
    });

    this.resources.eventListeners = [];
  }

  /**
   * Clean up all tracked resources
   * @private
   */
  _cleanupResources() {
    // Clear all timeouts
    this.resources.timeouts.forEach((id) => clearTimeout(id));
    this.resources.timeouts = [];

    // Clear all intervals
    this.resources.intervals.forEach((id) => clearInterval(id));
    this.resources.intervals = [];

    // Cancel all animation frames
    this.resources.animationFrames.forEach((id) => cancelAnimationFrame(id));
    this.resources.animationFrames = [];

    // Remove all tracked event listeners
    this._removeTrackedEventListeners();
  }

  /**
   * Reset all game systems
   * @private
   */
  _resetSystems() {
    // console.log("[Engine] Resetting all systems");

    // Reset game state
    this.systems.state.reset();

    // Reset animation
    if (this.systems.animation) {
      this.systems.animation.stop();
      this.systems.animation.isPaused = false;
      this.systems.animation.changeState("idle");
    }

    // Reset freedom manager
    if (this.systems.freedom) {
      this.systems.freedom.reset();
    }

    // Reset collision detection
    if (this.systems.collision && typeof this.systems.collision.reset === "function") {
      this.systems.collision.reset();
    }

    // Reset other managers if they exist
    if (window.protestorHitboxManager) {
      window.protestorHitboxManager.cleanupAll();
    }

    if (window.speedManager) {
      window.speedManager.reset();
      window.speedManager.startSpeedProgression();
    }
  }

  /**
   * Request a new animation frame
   * @private
   */
  // worried about this
  _requestAnimationFrame() {
    this.systems.state.currentAnimationFrame = requestAnimationFrame(this._updateGameFrame);
    this.resources.animationFrames.push(this.systems.state.currentAnimationFrame);
  }

  /**
   * Update the game on each animation frame
   * @param {number} timestamp - Current timestamp
   * @private
   */
  _updateGameFrame(timestamp) {

    // Calculate delta time in milliseconds
    const deltaTime = timestamp - (this.systems.state.lastFrameTime || timestamp);
    this.systems.state.lastFrameTime = timestamp;

    // Update freedom system if available
    if (this.systems.freedom) {
      this.systems.freedom.update(deltaTime);
    }

    // Continue animation loop
    this._requestAnimationFrame();
  }

  handleGlobeClick(event) {
    if (event.target.classList.contains("hitbox") || this.systems.state.gameEnding || !this.systems.state.isPlaying) {
      return;
    }

    // Get the game container
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    // Apply light shake effect
    gameContainer.classList.add("light-screen-shake");

    // Remove the class after animation completes
    setTimeout(() => {
      gameContainer.classList.remove("light-screen-shake");
    }, 400);

    // Play a subtle click sound if available
    if (this.systems.audio) {
      this.systems.audio.playIfContextReady("ui", "worldClick", 0.3);
    }
  }

  _updateCountdown() {
    // Skip if game is paused
    if (this.systems.state.isPaused) return;

    // Log time for debugging
    const oldTime = this.systems.state.timeRemaining;

    // Decrement time
    this.systems.state.timeRemaining--;

    // Log significant time points
    if (oldTime % 10 === 0 || this.systems.state.timeRemaining <= 5) {
    }

    // Update UI
    this.systems.ui.updateProgressBar(this.systems.state.timeRemaining, this.config.GAME_DURATION);
    this.systems.ui.updateHUD(this.systems.state);

    // Enhanced check for time-based win condition
    if (this.systems.state.timeRemaining <= 0) {
      this.triggerGameEnd(this.END_STATES.RESISTANCE_WIN, "timer_expired");
    }
  }

  _pauseGame() {
    console.log("[Engine] Pausing game");

    // Stop countdown timer
    clearInterval(this.systems.state.countdownTimer);
    this.systems.state.countdownTimer = null;

    // Pause animations
    if (this.systems.animation) {
      this.systems.animation.pause();
    }

    // Pause freedom manager animations
    if (this.systems.freedom) {
      this.systems.freedom.pause();
    }

    // Show pause overlay
    this.systems.ui.createPauseOverlay();

    if (this.systems.audio) {
      try {
        this.systems.audio
          .resumeAudioContext()
          .then(() => {
            try {
              this.systems.audio.pauseAll();
            } catch (e) {
              console.warn("[Engine] Error in pauseAll:", e);
            }
          })
          .catch((e) => {
            console.warn("[Engine] Failed to resume audio context for pause:", e);
            // Try to pause anyway
            try {
              this.systems.audio.pauseAll();
            } catch (err) {
              // Silent fail
            }
          });
      } catch (error) {
        console.warn("[Engine] Error pausing audio:", error);
      }
    }

    // this.systems.ui.announceForScreenReaders("Game paused");
  }

  _resumeGame() {
    // Remove pause overlay
    this.systems.ui.removePauseOverlay();

    // Resume timers
    this.systems.state.countdownTimer = this.createTrackedInterval(this._updateCountdown.bind(this), 1000);

    // Resume animations
    if (this.systems.animation) {
      this.systems.animation.resume();
    }

    // Resume freedom manager animations
    if (this.systems.freedom) {
      this.systems.freedom.resume();
    }

    // Restart grab sequence
    this.initiateGrab();

    if (this.systems.audio) {
      // First resume audio context
      this.systems.audio
        .resumeAudioContext()
        .then(() => {
          try {
            this.systems.audio.resumeAll();
          } catch (error) {
            console.warn("[Engine] Error resuming audio:", error);
          }
        })
        .catch((e) => {
          console.warn("[Engine] Failed to resume audio context:", e);
        });
    }

    // this.systems.ui.announceForScreenReaders("Game resumed");
  }

  /**
   * Select a target country for grabbing
   * @private
   * @returns {string|null} The selected country name or null if none available
   */
  _selectTargetCountry() {
    const state = this.systems.state;
    const availableCountries = Object.keys(state.countries).filter((country) => {
      return state.countries[country].claims < state.countries[country].maxClaims;
    });

    if (availableCountries.length === 0) {
      return null;
    }

    // Rarely repeats target so it's unpredictable
    const REPEAT_CHANCE = 0.08;
    const lastTarget = state.lastGrabTarget;
    const canRepeat = lastTarget && availableCountries.length > 1 && availableCountries.includes(lastTarget);

    let picked;
    if (canRepeat && Math.random() < REPEAT_CHANCE) {
      picked = lastTarget;
    } else if (canRepeat) {
      const others = availableCountries.filter((country) => country !== lastTarget);
      picked = others[Math.floor(Math.random() * others.length)];
    } else {
      picked = availableCountries[Math.floor(Math.random() * availableCountries.length)];
    }

    state.lastGrabTarget = picked;
    return picked;
  }

  /**
   * Select an animation for the target country
   * @private
   * @param {string} targetCountry - The target country
   * @returns {Object} Animation info
   */
  _selectAnimationForCountry(targetCountry) {
    // Get current size from FreedomManager
    const currentSize = window.freedomManager?.getTrumpSize()?.size || "normal";

    const possibleAnimations = this.systems.state.countryAnimations[targetCountry];
    let animationName = possibleAnimations[Math.floor(Math.random() * possibleAnimations.length)];

    // Try a size-specific variant if not normal
    if (currentSize !== "normal") {
      const sizedAnimationVariant = `${animationName}${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)}`;

      console.log("[GRAB DEBUG] Checking sized animation variant:", {
        baseAnimation: animationName,
        sizedVariant: sizedAnimationVariant,
      });

      if (window.animationManager.animations[sizedAnimationVariant]) {
        animationName = sizedAnimationVariant;
      } else {
        console.warn("[GRAB DEBUG] No sized variant found, using base animation");
      }
    }

    return {
      animationName,
      isEastCanada: animationName.includes("grabEastCanada"),
      isWestCanada: animationName.includes("grabWestCanada"),
    };
  }

  /**
   * Prepare the grab sequence
   * @private
   * @param {string} targetCountry - The target country
   * @param {Object} animationInfo - Animation information
   */
  _prepareGrabSequence(targetCountry, animationInfo) {
    // Load country-specific sounds when targeting a country
    if (this.systems.audio && typeof this.systems.audio.loadCountrySounds === "function") {
      // this.systems.audio.loadCountrySounds(targetCountry);
    }

    // Preserve east/west Canada for visual placement
    // Keep targetCountry as canada for shared state
    if (animationInfo.isEastCanada) {
      this.systems.state.currentTarget = "eastCanada";
    } else if (animationInfo.isWestCanada) {
      this.systems.state.currentTarget = "westCanada";
    } else {
      this.systems.state.currentTarget = targetCountry;
    }

    this.systems.state.isEastCanadaGrab = animationInfo.isEastCanada;
    this.systems.state.isWestCanadaGrab = animationInfo.isWestCanada;

    // Check if this is the first block
    const isBeforeFirstBlock = this.systems.state.stats.successfulBlocks === 0;

    if (window.trumpHandEffects) {
      window.trumpHandEffects.makeHittable(isBeforeFirstBlock);
      // Use generic "canada" for UI highlighting
      window.trumpHandEffects.highlightTargetCountry(targetCountry, true);
      window.trumpHandEffects.setGrabbingState();

      // Explicitly check for prompt
      window.trumpHandEffects.updatePromptVisibility();
    } else {
    }
  }

  /**
   * Start the grab animation
   * @private
   * @param {string} targetCountry - The target country
   * @param {string} animationName - The animation name
   */
  _startGrabAnimation(targetCountry, animationName) {
    if (!this.systems.animation) return;

    // Start the animation with completion callback
    this.systems.animation.changeState(animationName, () => {
      try {
        // Check if the grab is still valid
        // Canada: check targetCountry vs east/west currentTarget
        const isCanadaGrab =
          targetCountry === "canada" && (this.systems.state.currentTarget === "eastCanada" || this.systems.state.currentTarget === "westCanada");

        const isValidGrab = this.systems.state.currentTarget === targetCountry || isCanadaGrab;

        if (isValidGrab && this.systems.state.isPlaying && !this.systems.state.isPaused) {
          // Handle grab success with actual currentTarget
          this.grabSuccess(this.systems.state.currentTarget);
        } else if (this.systems.state.isPlaying && !this.systems.state.isPaused) {
          // Interrupted or blocked - start next cycle
          this.initiateGrab();
        }

        // Clean up visual elements
        this.systems.ui.cleanupGrabVisuals();
      } catch (error) {
        console.error("[Engine] Error in grab animation callback:", error);
        // Avoid getting stuck: reset state, continue
        this._resetGrabTarget();
        if (this.systems.state.isPlaying && !this.systems.state.isPaused) {
          this.initiateGrab();
        }
      }
    });
  }

  /**
   * Determine the specific region being smacked
   * @private
   * @param {string} targetCountry - The target country
   * @returns {string} The specific region
   */
  _determineSmackRegion(targetCountry) {
    if (targetCountry === "canada") {
      if (this.systems.state.isEastCanadaGrab) {
        return "eastCanada";
      } else if (this.systems.state.isWestCanadaGrab) {
        return "westCanada";
      }
    }
    return targetCountry;
  }

  /**
   * Reset the grab target
   * @private
   */
  _resetGrabTarget() {
    this.systems.state.currentTarget = null;
    this.systems.state.isEastCanadaGrab = false;
    this.systems.state.isWestCanadaGrab = false;
  }

  /**
   * Update score after a successful block
   * @private
   */
  _updateScoreAfterBlock() {
    const state = this.systems.state;

    if (state.stats.successfulBlocks === 0 && window.handHitboxManager) {
      window.handHitboxManager.handleSuccessfulHit();
    }

    let scoreElement = document.getElementById("score");
    scoreElement.classList.add("score-bounce");
    setTimeout(() => {
      scoreElement.classList.remove("score-bounce");
    }, 500);

    // Increase score
    state.score += 10;

    // Track consecutive hits and stats
    state.consecutiveHits++;
    state.stats.successfulBlocks++;

    // Update HUD
    this.systems.ui.updateHUD(state);
  }

  /**
   * Play the block animation sequence
   * @private
   * @param {string} smackRegion - The region being smacked
   */
  _playBlockAnimationSequence(smackRegion) {
    if (this.systems.state.isPlayingAnimationSequence) return;
    this.systems.state.isPlayingAnimationSequence = true;

    let sequenceFinished = false;
    const finishSequence = () => {
      if (sequenceFinished) return;
      sequenceFinished = true;
      this.systems.state.isPlayingAnimationSequence = false;
      this.initiateGrab();
    };

    // Fallback timeout in case callback never fires
    this.createTrackedTimeout(finishSequence, 3000);

    if (this.systems.animation) {
      // Play smack animation if system exists
      this.systems.animation.playSmackAnimation(smackRegion, () => {
        // After smack completes, play slapped animation
        this.systems.animation.changeState("slapped", finishSequence);
      });
    } else {
      // Last resort fallback
      this.createTrackedTimeout(finishSequence, 1000);
    }
  }

  _handleCanadaGrab(eastOeWest) {
    const state = this.systems.state;

    // Increment claim on the shared Canada entity

    // Get current claim count
    const claimCount = state.countries.canada.claims;

    if (this.systems.audio) {
      if (claimCount < state.countries.canada.maxClaims) {
        console.log("iii grabbed canada");

        this.systems.audio.playSuccessfulGrab("canada");
      } else {
        console.log("iii fully annexed canada");

        this.systems.audio.playCountryFullyAnnexedCry("canada");
        this.makeCountryAnnexationAnnouncement("canada");
      }
    }

    // Update flag overlay
    this.systems.ui.updateFlagOverlay("canada", claimCount);
  }
  _handleStandardCountryGrab(country) {
    console.log("iii handling a standard country grab");

    const state = this.systems.state;
    const claimCount = state.countries[country].claims;
    const isFullAnnexation = claimCount >= state.countries[country].maxClaims;

    console.log("iii claimcount is", claimCount);

    if (isFullAnnexation) {
      console.log("iii fully annexed");
      this.systems.audio.playCountryFullyAnnexedCry(country);
      this.makeCountryAnnexationAnnouncement(country);
    } else {
      console.log("iii partially annexed");
      this.systems.audio.playSuccessfulGrab(country);
    }

    // Update flag overlay
    this.systems.ui.updateFlagOverlay(country, claimCount);
  }

  _checkGameOverCondition() {
    const state = this.systems.state;

    // Count annexed countries
    const countriesToCheck = this.config.COUNTRIES;
    const claimedCountries = countriesToCheck.filter((country) => state.countries[country].claims >= state.countries[country].maxClaims);

    // Game over if all countries are claimed
    const isGameOver = claimedCountries.length >= countriesToCheck.length;

    if (isGameOver) {
    }

    return isGameOver;
  }
  /**
   * Schedule auto-restart after game over
   * @private
   */
  _scheduleAutoRestart() {
    console.log("restart _scheduleAutoRestart");
    
    this.createTrackedTimeout(() => {
      const recorderModal = document.getElementById("voice-recorder-modal");
      const thankYouModal = document.getElementById("thank-you-message");

      // Check modals hidden, no interaction occurred
      const canAutoRestart =
        (!recorderModal || recorderModal.classList.contains("hidden")) &&
        (!thankYouModal || thankYouModal.classList.contains("hidden")) &&
        (!window.voiceRecorder || window.voiceRecorder.userInteracted !== true);

      if (canAutoRestart) {
        console.log("restart canAutoRestart");

        // document.getElementById("restart-button").style.visibility = "block"
        // this.restartGame();
      }
    }, this.config.AUTO_RESTART_DELAY);
  }

  _cleanupAllFlags() {
    // Remove flag elements from DOM
    document.querySelectorAll(".trump-flag-animation").forEach((flag) => {
      if (flag.parentNode) {
        flag.parentNode.removeChild(flag);
      }
    });

    // Clear flag references in state
    if (this.systems.state && this.systems.state.countries) {
      Object.keys(this.systems.state.countries).forEach((countryId) => {
        if (this.systems.state.countries[countryId]) {
          this.systems.state.countries[countryId].flags = [];
        }
      });
    }

    // Call animator's cleanup if it exists
    if (window.animationManager && typeof window.animationManager.removeAllFlags === "function") {
      window.animationManager.removeAllFlags();
    }
  }
}
