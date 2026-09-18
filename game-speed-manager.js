class GameSpeedManager {
  /**
   * Create a new GameSpeedManager
   * @param {Object} gameState - The game state object
   * @param {Object} animationManager - The animation manager
   * @param {Object} audioManager - The audio manager
   */
  constructor(gameState, animationManager, audioManager) {
    // System references
    this.gameState = gameState;
    this.animationManager = animationManager;
    this.audioManager = audioManager;

    // Configuration
    this.config = {
      NOTIFICATION_DURATION: 5100,
      INITIAL_INSTRUCTION_DELAY: 6000,
      INSTRUCTION_INTERVAL: 8100,
      TUTORIAL_TIMEOUT: 45000,
      DEFAULT_SPEED_INTERVAL: 16000,
    };

    // Speed levels configuration
    this.baseSpeedLevels = [
      { multiplier: 1.2, name: "Tutorial", sound: "tutorial" },
      { multiplier: 2.1, name: "Faster?", sound: "faster" },
      { multiplier: 3.1, name: "oopsie trade war", sound: "oopsieTradeWar" },
      { multiplier: 4.1, name: "Faster", sound: "faster" },
      { multiplier: 4.8, name: "Faster", sound: "faster" },
      { multiplier: 5.5, name: "get up and fight", sound: "getUpAndFight" },

      { name: "CANADA LIBERATED!", sound: "canadaLiberated", isCustom: true },
      { name: "MEXICO LIBERATED!", sound: "mexicoLiberated", isCustom: true },
      { name: "GREENLAND LIBERATED!", sound: "greenlandLiberated", isCustom: true },

      { name: "Nice! YOU SHRUNK him!", sound: "shrink1", isCustom: true },
      { name: "SHRINKY DINK!", sound: "shrink2", isCustom: true },
      { name: "BITE-SIZED!", sound: "shrink3", isCustom: true },
      { name: "BYE TRUMPY!", sound: "finalShrink", isCustom: true },
    ];

    this.isMobile = window.DeviceUtils ? window.DeviceUtils.isMobile() : false;

    // Mobile speed levels (already easier)
    this.mobileSpeedLevels = this.baseSpeedLevels;

    // Desktop speed levels (slower for trackpad users)
    this.desktopSpeedLevels = this.baseSpeedLevels.map((level) => ({
      ...level,
      multiplier: Math.max(level.multiplier * 0.7, 0.7), // 30% slower for desktop/trackpad
    }));

    // Choose appropriate speed levels based on device
    this.speedLevels = this.isMobile ? this.mobileSpeedLevels : this.desktopSpeedLevels;

    // Tutorial instruction messages
    this.instructionMessages = [
      { text: "STOP HIM!", audio: "stopHim" },
      { text: "SMACK THAT HAND!", audio: "smackThatHand" },
      { text: "CLICK ON TRUMPS HAND AS HE GRABS A COUNTRY!", audio: "instruction" },
      { text: "HANDS OFF!", audio: "stopHim" },
    ];

    // State variables
    this.state = {
      currentSpeedIndex: 0,
      initialInstructionsShown: false,
      currentInstructionIndex: 0,
      tutorialCompleted: false,
      initialBlockCount: 0,
    };

    // Timers
    this.timers = {
      speedIncreaseInterval: null,
      instructionTimeout: null,
      tutorialFailsafeTimeout: null,
    };

    // Only one banner on screen at once
    this.activeNotification = { element: null, timeoutId: null };
  }

  /**
   * Initialize the manager
   */
  init() {
    // Nothing needed here for initialization
  }

  showNotification(message, customSound = null) {
    // New banner replaces the current one
    if (this.activeNotification.timeoutId) {
      clearTimeout(this.activeNotification.timeoutId);
    }
    if (this.activeNotification.element?.parentNode) {
      this.activeNotification.element.parentNode.removeChild(this.activeNotification.element);
    }

    // Create notification element
    const notification = this._createNotificationElement(message);

    // Add to game screen
    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      gameScreen.appendChild(notification);

      // Play custom sound if provided
      if (customSound && this.audioManager) {
        this.audioManager.playIfContextReady("ui", customSound, 0.8);
      }

      // Remove after full display duration
      const timeoutId = setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (this.activeNotification.element === notification) {
          this.activeNotification = { element: null, timeoutId: null };
        }
      }, this.config.NOTIFICATION_DURATION);

      this.activeNotification = { element: notification, timeoutId };
    }
  }

  _createNotificationElement(message) {
    const notification = document.createElement("div");
    notification.className = "speed-notification";
    notification.textContent = message;

    // Add accessibility attributes
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive");

    return notification;
  }

  /**
   * Start the speed progression system
   * @param {number} intervalMs - Milliseconds between speed increases
   */
  startSpeedProgression(intervalMs = this.config.DEFAULT_SPEED_INTERVAL) {
    // Clear any existing timers
    this.stopSpeedProgression();

    // Initialize tutorial state
    this._initializeTutorial();

    // Schedule initial instructions if not shown yet
    if (!this.state.initialInstructionsShown) {
      this.showInitialInstructions();
    }
  }

  _initializeTutorial() {
    // Capture block count to detect first block
    this.state.initialBlockCount = this.gameState.stats.successfulBlocks;
    this.state.tutorialCompleted = false;

    // Reset to initial tutorial speed
    this.state.currentSpeedIndex = 0;
    this.setSpeed(this.speedLevels[0].multiplier);
  }

  checkTutorialCompletion() {
    // Complete once player has blocked once
    if (this.gameState.stats.successfulBlocks > this.state.initialBlockCount) {
      if (!this.state.tutorialCompleted) {
        // console.log("Tutorial completed! Player has successfully blocked.");
        this.state.tutorialCompleted = true;

        // Clean up tutorial timers
        this._cleanupTutorialTimers();

        // Start speed progression, tutorial done
        this._startRegularSpeedProgression();
      }
      return true;
    }
    return false;
  }

  _cleanupTutorialTimers() {
    // Clear instruction timeout
    if (this.timers.instructionTimeout) {
      clearTimeout(this.timers.instructionTimeout);
      this.timers.instructionTimeout = null;
    }

    // Clear existing speed interval
    if (this.timers.speedIncreaseInterval) {
      clearInterval(this.timers.speedIncreaseInterval);
      this.timers.speedIncreaseInterval = null;
    }
  }

  _startRegularSpeedProgression() {
    let currentInterval = this.config.DEFAULT_SPEED_INTERVAL;

    this.timers.speedIncreaseInterval = setInterval(() => {
      // Add check for gameEnding state
      if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.gameEnding) return;
      if (this.state.currentSpeedIndex < this.speedLevels.length - 1) {
        this.increaseSpeed();

        // More aggressive interval reduction in later stages
        const reductionFactor = this.state.currentSpeedIndex >= 3 ? 0.7 : 0.9;
        currentInterval = Math.max(currentInterval * reductionFactor, 8000);

        // Reset the interval with new timing
        clearInterval(this.timers.speedIncreaseInterval);
        this._startRegularSpeedProgression();
      }
    }, currentInterval);

    // Store reference in game state for cleanup
    this.gameState.speedIncreaseInterval = this.timers.speedIncreaseInterval;
  }

  /**
   * Show initial tutorial instructions
   */
  showInitialInstructions() {
    this.state.initialInstructionsShown = true;
    this.state.currentInstructionIndex = 0;

    // Clear any existing timeout
    if (this.timers.instructionTimeout) {
      clearTimeout(this.timers.instructionTimeout);
    }

    // Show the first instruction after a delay
    this.timers.instructionTimeout = setTimeout(() => {
      this.showNextInstruction();
    }, this.config.INITIAL_INSTRUCTION_DELAY);

    this._setupTutorialFailsafe();
  }

  /**
   * @private
   */
  _setupTutorialFailsafe() {
    this.timers.tutorialFailsafeTimeout = setTimeout(() => {
      if (!this.state.tutorialCompleted) {
        // console.log("Tutorial timeout reached. Auto-completing tutorial.");
        this.state.tutorialCompleted = true;

        // Clean up timers
        this._cleanupTutorialTimers();

        // Start regular speed progression
        this._startRegularSpeedProgression();
      }
    }, this.config.TUTORIAL_TIMEOUT);
  }

  showNextInstruction() {
    if (this.gameState.isPaused) return;
    if (this.gameState.gameEnding) return;

    // Skip if tutorial is already completed
    if (this.checkTutorialCompletion()) {
      return;
    }

    if (this.state.currentInstructionIndex >= this.instructionMessages.length) {
      this.state.currentInstructionIndex = 0;
    }

    // Show current instruction
    this._displayCurrentInstruction();

    // Schedule next instruction if tutorial not completed
    this._scheduleNextInstruction();
  }

  _displayCurrentInstruction() {
    const instruction = this.instructionMessages[this.state.currentInstructionIndex];

    // Show notification
    if (instruction.text) {
      this.showNotification(instruction.text);
    }

    if (this.audioManager && instruction.audio) {
      // this.audioManager.play("ui", instruction.audio, 0.6);
      this.audioManager.playIfContextReady("ui", instruction.audio, 0.8);
    }

    // Move to next instruction for next time
    this.state.currentInstructionIndex++;
  }

  /**
   * Schedule the next instruction
   * @private
   */
  _scheduleNextInstruction() {
    this.timers.instructionTimeout = setTimeout(() => {
      // Recheck tutorial/pause state before showing
      if (!this.state.tutorialCompleted && !this.gameState.isPaused) {
        this.showNextInstruction();
      }
    }, this.config.INSTRUCTION_INTERVAL);
  }

  stopSpeedProgression() {
    // Clear speed increase interval
    if (this.timers.speedIncreaseInterval) {
      clearInterval(this.timers.speedIncreaseInterval);
      this.timers.speedIncreaseInterval = null;
    }

    // Clear instruction timeout
    if (this.timers.instructionTimeout) {
      clearTimeout(this.timers.instructionTimeout);
      this.timers.instructionTimeout = null;
    }

    // Clear tutorial failsafe timeout
    if (this.timers.tutorialFailsafeTimeout) {
      clearTimeout(this.timers.tutorialFailsafeTimeout);
      this.timers.tutorialFailsafeTimeout = null;
    }

    // Remove all notifications
    this._removeAllNotifications();

    // Also unlink gameState's interval reference
    if (this.gameState && this.gameState.speedIncreaseInterval) {
      clearInterval(this.gameState.speedIncreaseInterval);
      this.gameState.speedIncreaseInterval = null;
    }
  }

  /**
   * Remove all notification elements
   * @private
   */
  _removeAllNotifications() {
    const gameScreen = document.getElementById("game-screen");
    if (gameScreen) {
      const notifications = gameScreen.querySelectorAll(".speed-notification");
      notifications.forEach((notification) => {
        notification.remove();
      });
    }
  }

  /**
   * @returns {boolean} True if speed was increased
   */
  increaseSpeed() {
    // Only increase speed if tutorial is completed
    if (!this.state.tutorialCompleted) {
      return false;
    }

    if (this.state.currentSpeedIndex < this.speedLevels.length - 1) {
      // Move to next speed level
      this.state.currentSpeedIndex++;
      const newSpeed = this.speedLevels[this.state.currentSpeedIndex];

      // Apply the new speed
      this.setSpeed(newSpeed.multiplier);

      // Show notification
      this.showNotification(newSpeed.name.toUpperCase() + "!");

      // Play appropriate sound
      this._playSpeedChangeSound(newSpeed);

      // console.log(`Game speed increased to ${newSpeed.multiplier.toFixed(2)}x (${newSpeed.name})`);

      return true;
    }
    return false;
  }

  _playSpeedChangeSound(speedLevel) {
    if (!this.audioManager) return;

    if (speedLevel.sound) {
      try {
        // Make sure audioContext is resumed first
        if (typeof this.audioManager.resumeAudioContext === "function") {
          // this.audioManager.resumeAudioContext().then(() => {
          this.audioManager.playIfContextReady("ui", speedLevel.sound, 0.6);
          // });
        } else {
          // Direct play as fallback
          this.audioManager.play("ui", speedLevel.sound, 0.6);
        }
      } catch (error) {
        this.audioManager.play("ui", "speedup", 0.6);
      }
    } else {
      // Fall back to generic speedup sound
      this.audioManager.play("ui", "speedup", 0.6);
    }
  }

  /**
   * @param {number} multiplier - Speed multiplier value
   */
  setSpeed(multiplier) {
    this.gameState.gameSpeedMultiplier = multiplier;

    // Update both animation and audio systems
    if (this.animationManager && typeof this.animationManager.setGameSpeed === "function") {
      this.animationManager.setGameSpeed(multiplier);
    }

    if (this.audioManager && typeof this.audioManager.setGameSpeed === "function") {
      this.audioManager.setGameSpeed(multiplier);
    }
  }

  /**
   * Get the current speed information
   * @returns {Object} Current speed info with multiplier and name
   */
  getCurrentSpeed() {
    return {
      multiplier: this.gameState.gameSpeedMultiplier,
      name: this.speedLevels[this.state.currentSpeedIndex].name,
    };
  }

  /**
   * Reset the speed manager to initial state
   */
  reset() {
    // Stop all timers
    this.stopSpeedProgression();

    this.state.currentSpeedIndex = 0;
    this.state.initialInstructionsShown = false;
    this.state.currentInstructionIndex = 0;
    this.state.tutorialCompleted = false;
    this.state.initialBlockCount = 0;

    this.setSpeed(this.speedLevels[0].multiplier);
    this._removeAllNotifications();
  }

  /**
   * Clean up resources used by the manager
   */
  destroy() {
    // Reset state and clean up
    this.reset();

    // Remove any lingering UI elements
    this._removeAllNotifications();
  }
}
