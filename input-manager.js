/**
 * Input Manager - Handles all user input
 */

class InputManager {
  constructor() {
    this.handlers = {
      onSpaceKey: null,
      onPauseKey: null,
      onStartKey: null,
    };

    this.ui = null;
    this.document = null;
  }

  /**
   * Initialize input manager
   * @param {Document} document - Document object
   * @param {Object} handlers - Event handlers
   */
  init(document, handlers) {
    this.document = document;
    this.handlers = handlers;

    this._setupKeyboardHandlers();
    this._setupButtonHandlers();
    this._setupHitboxHandlers();
  }

  /**
   * Add additional handlers after initial setup
   * @param {Object} handlers - Event handlers to add
   */
  addHandlers(handlers) {
    // Add these handlers to existing ones
    this.handlers = { ...this.handlers, ...handlers };

    // Re-setup keyboard handlers
    this._setupKeyboardHandlers();

    // Re-setup hitbox handlers
    this._setupHitboxHandlers();
  }

  /**
   * Connect to UI manager
   * @param {UIManager} ui - UI manager reference
   */
  connectUI(ui) {
    this.ui = ui;
  }

  // PRIVATE METHODS

  /**
   * Set up keyboard handlers
   * @private
   */
  _setupKeyboardHandlers() {
    // Remove any existing keyboard listeners first
    if (this._keyboardHandler) {
      this.document.removeEventListener("keydown", this._keyboardHandler);
    }

    // New handler, kept for later removal
    this._keyboardHandler = (e) => {
      // Start game via Space or Enter
      if (
        (e.key === " " || e.key === "Enter") &&
        this.handlers.onStartKey &&
        document.getElementById("intro-screen") &&
        !document.getElementById("intro-screen").classList.contains("hidden")
      ) {
        e.preventDefault();
        this.handlers.onStartKey();
      }

      // Toggle pause with P key during gameplay
      if (e.key === "p" && this.handlers.onPauseKey) {
        e.preventDefault();
        this.handlers.onPauseKey();
      }

      // Block hand with Space during gameplay
      if (e.key === " " && this.handlers.onSpaceKey) {
        e.preventDefault();
        this.handlers.onSpaceKey();
      }
    };

    // Add the new handler
    this.document.addEventListener("keydown", this._keyboardHandler);
  }

  _setupButtonHandlers() {
    const startButton = document.getElementById("start-button");
    if (startButton && this.handlers.onStartKey) {
      startButton.addEventListener("click", (e) => {
        e.preventDefault();

        if (window.audioManager) {
          window.audioManager
            .resumeAudioContext()
            .then(() => {
              // Initialize audio system
              if (typeof window.audioManager.init === "function") {
                window.audioManager.init();
                window.audioManager.startDiagnosticAuditing();
              }

              try {
                window.audioManager.primeAudioPool({ skipClickSound: true });
              } catch (e) {
                console.warn("[Input] Error priming audio pool:", e);
              }

              // Play click sound
              window.audioManager.play("ui", "click", 0.5).catch((error) => {
                console.warn("[Input] Click sound play error:", error);
                window.audioManager.playDirect("click.mp3", 0.5);
              });
            })
            .catch((e) => {
              console.warn("[Input] Failed to resume audio context:", e);
              // Try click sound as last resort
              try {
                window.audioManager.playDirect("click.mp3", 0.5);
              } catch (err) {
                // Silent fail
              }
            });
        }

        // Start game after a short delay
        setTimeout(() => {
          this.handlers.onStartKey();
        }, 200);
      });
    }
  }

  /**
   * Set up Trump hand hitbox handlers
   * @private
   */
  _setupHitboxHandlers() {
    // Get the hitbox element
    const trumpHandHitBox = document.getElementById("trump-hand-hitbox");
    if (!trumpHandHitBox || !this.handlers.onSpaceKey) return;

    // Reliable tracking for removing listeners
    if (!trumpHandHitBox) return;

    this._hitboxElement = trumpHandHitBox;

    // Create unified handler for all hitbox events
    const handleHitboxEvent = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();

      // Check audio initialization
      if (this.audio && !this.audio.initialized && typeof this.audio.init === "function") {
        this.audio.init();
      }

      if (this.handlers.onSpaceKey) {
        this.handlers.onSpaceKey(event);
      }
    };

    // Remove old listeners if element unchanged
    if (this._hitboxHandlers && this._hitboxElement === trumpHandHitBox) {
      Object.entries(this._hitboxHandlers).forEach(([event, handler]) => {
        trumpHandHitBox.removeEventListener(event, handler);
      });
    }

    // Store new handlers
    this._hitboxHandlers = {
      click: handleHitboxEvent,
      touchstart: handleHitboxEvent,
      mousedown: handleHitboxEvent,
    };

    // Add new event listeners
    Object.entries(this._hitboxHandlers).forEach(([event, handler]) => {
      trumpHandHitBox.addEventListener(event, handler, { passive: false });
    });
    trumpHandHitBox.addEventListener("touchend", (e) => e.preventDefault(), { passive: false });

    // Update reference in hitbox manager
    if (window.handHitboxManager) {
      window.handHitboxManager.trumpHandHitBox = trumpHandHitBox;
    }
  }
}
