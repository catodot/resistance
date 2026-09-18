
class DebugManager {
  /**
   * Create a new DebugManager instance
   * @param {Object} gameElements - UI element references
   * @param {Object} gameState - Game state reference
   * @param {Object} animationManager - Animation manager reference
   */
  constructor(gameElements, gameState, animationManager) {
    this.enabled = true;
    this.elements = gameElements || {};
    this.gameState = gameState || {};
    this.animationManager = animationManager;

    // Reference to other game managers
    this.audioManager = null;
    this.freedomManager = null;
    this.handHitboxManager = null;
    this.protestorHitboxManager = null;
    this.UFOManager = null;
    this.speedManager = null;

    // Debug panel elements
    this.panel = null;
    this.sections = {};
    this.controls = {};

    // Track open/closed state of collapsible sections
    this.sectionStates = {};

    this.resistanceStatusInterval = null;

    // Calibration state
    this.calibration = {
      isCalibrating: false,
      originalAnimState: null,
      currentAnimation: null,
      frameCoordinates: [],
      wasPlaying: false,
      wasPaused: false,
      originalHandlerClick: null,
      originalHandlerTouch: null,
      originalContainerClick: null,
    };

    // Protestor calibration state
    this.protestorCalibration = {
      isCalibrating: false,
      country: null,
      wasPlaying: false,
      wasPaused: false,
      originalCoordinates: null,
      locationIndex: 0,
      totalLocations: 3,
    };

    // Bind methods for event handling
    this._bindMethods();

    // console.log("[Debug] Debug Manager created");
  }

  /**
   * Bind class methods to maintain 'this' context
   * @private
   */
  _bindMethods() {
    this.togglePanel = this.togglePanel.bind(this);
    this.toggleSectionVisibility = this.toggleSectionVisibility.bind(this);
    this.updateResistanceStatus = this.updateResistanceStatus.bind(this);
    this.setupKeyBindings = this.setupKeyBindings.bind(this);
  }

  init() {
    if (!this.enabled) return;

    this.createDebugPanel();

    // Add toggle button to show/hide debug panel
    this.createToggleButton();

    // Set up all sections
    this.setupGameControlsSection();
    this.setupHitboxControlsSection();
    this.setupAudioControlsSection();
    this.setupResistanceControlsSection();
    this.setupUfoControlsSection();
    this.setupPerformanceControlsSection();

    // Initialize panel state
    this.panel.classList.toggle("hidden", localStorage.getItem("debugPanelVisible") !== "true");

    // Restore section visibility states from localStorage
    this.restoreSectionStates();

    this.setupKeyBindings();

    // Connect to other managers if they exist
    this.connectManagers();

    // Start status updates
    this.startStatusUpdates();

    // console.log("[Debug] Debug panel initialized");

    return this;
  }

  /**
   * Create the main debug panel
   */
  createDebugPanel() {
    // Look for existing panel first
    this.panel = document.getElementById("debug-panel");

    // Create new panel if it doesn't exist
    if (!this.panel) {
      this.panel = document.createElement("div");
      this.panel.id = "debug-panel";
      this.panel.className = "dbg-panel";
      document.body.appendChild(this.panel);
    } else {
    }

    // Add panel title
    const title = document.createElement("div");
    title.className = "dbg-panel-title";
    title.innerHTML = "<span>DEBUG TOOLS</span>";
    this.panel.appendChild(title);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.className = "dbg-close-button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => this.togglePanel(false));
    title.appendChild(closeButton);
  }
  createToggleButton() {
    let toggleBtn = document.getElementById("debug-toggle");

    // Create if it doesn't exist
    if (!toggleBtn) {
      toggleBtn = document.createElement("div");
      toggleBtn.id = "debug-toggle";
      toggleBtn.className = "dbg-toggle";
      toggleBtn.textContent = "D";
      toggleBtn.title = "Toggle Debug Panel";
      document.body.appendChild(toggleBtn);
    }

    const isVisible = localStorage.getItem("debugPanelVisible") === "true";
    toggleBtn.classList.toggle("dbg-toggle-active", isVisible);

    // Remove any existing click handlers first
    const oldButton = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(oldButton, toggleBtn);

    // Add click handler
    oldButton.addEventListener("click", (e) => {
      // console.log("[Debug] Toggle button clicked");
      this.togglePanel();
    });
}

togglePanel(forceState) {
  // Check current state
  const isHidden = this.panel.classList.contains("hidden");
  
  // Flip the state unless forceState is provided
  const shouldShow = (forceState !== undefined) ? forceState : isHidden;
  
  // Apply change directly
  this.panel.classList.toggle("hidden", !shouldShow);
  
  // Update button
  const toggleBtn = document.getElementById("debug-toggle");
  if (toggleBtn) {
    toggleBtn.classList.toggle("dbg-toggle-active", shouldShow);
  }
  
  // Save state
  localStorage.setItem("debugPanelVisible", shouldShow);
  
  // Update statuses
  if (shouldShow) {
    this.startStatusUpdates();
  } else {
    this.stopStatusUpdates();
  }
}

  /**
   * @param {string} id - Section ID
   * @param {string} title - Section title
   * @param {boolean} fullWidth - Whether the content should be full width
   * @returns {Object} Object containing section elements
   */
  createSection(id, title, fullWidth = false) {
    const section = document.createElement("div");
    section.id = `debug-section-${id}`;
    section.className = "dbg-section";

    const header = document.createElement("div");
    header.className = "dbg-section-header";
    header.innerHTML = `<span>${title}</span><span class="toggle-icon">▼</span>`;
    header.addEventListener("click", () => this.toggleSectionVisibility(id));

    const content = document.createElement("div");
    content.id = `debug-section-content-${id}`;
    content.className = fullWidth ? "dbg-section-content full-width" : "dbg-section-content";

    // Check if section should start hidden
    if (this.sectionStates[id] === false) {
      content.classList.add("hidden");
      header.querySelector(".toggle-icon").textContent = "►";
    }

    section.appendChild(header);
    section.appendChild(content);
    this.panel.appendChild(section);

    this.sections[id] = {
      section,
      header,
      content,
    };

    return this.sections[id];
  }

  /**
   * Toggle section visibility
   * @param {string} id - Section ID
   */
  toggleSectionVisibility(id) {
    const section = this.sections[id];
    if (!section) return;

    const content = section.content;
    const icon = section.header.querySelector(".toggle-icon");

    const isHidden = content.classList.toggle("hidden");
    icon.textContent = isHidden ? "►" : "▼";

    // Save state to localStorage
    this.sectionStates[id] = !isHidden;
    this.saveSectionStates();
  }

  /**
   * Save section visibility states to localStorage
   */
  saveSectionStates() {
    localStorage.setItem("debugSectionStates", JSON.stringify(this.sectionStates));
  }

  /**
   * Restore section visibility states from localStorage
   */
  restoreSectionStates() {
    try {
      const savedStates = localStorage.getItem("debugSectionStates");
      if (savedStates) {
        this.sectionStates = JSON.parse(savedStates);
      }
    } catch (e) {
      console.error("Error restoring debug section states:", e);
      this.sectionStates = {};
    }
  }

  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Function} clickHandler - Click handler function
   * @param {Object} options - Button options
   * @returns {HTMLButtonElement} The created button
   */
  createButton(text, clickHandler, options = {}) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = options.className || "dbg-button";

    if (options.fullWidth) {
      button.classList.add("full-width");
    }

    if (options.small) {
      button.classList.add("small");
    }

    button.addEventListener("click", (e) => {
      if (clickHandler) {
        clickHandler(e);
      }

      if (options.showEffect) {
        this.showButtonEffect(button);
      }
    });

    if (options.tooltip) {
      button.title = options.tooltip;
    }

    return button;
  }

  /**
   * Show a button click effect
   * @param {HTMLButtonElement} button - The button element
   */
  showButtonEffect(button) {
    button.classList.add("button-active");
    setTimeout(() => {
      button.classList.remove("button-active");
    }, 300);
  }

  /**
   * Create a status display element
   * @param {string} id - Status element ID
   * @param {string} defaultText - Default text
   * @returns {HTMLDivElement} The created status element
   */
  createStatus(id, defaultText) {
    const status = document.createElement("div");
    status.id = id;
    status.className = "dbg-status";
    status.textContent = defaultText || "Status information will appear here";
    return status;
  }

  /**
   * Connect to other game managers
   */
  connectManagers() {
    // Find audio manager
    this.audioManager = window.audioManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.audio);

    // Find freedom manager
    this.freedomManager = window.freedomManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.freedom);

    // Find hitbox managers
    this.handHitboxManager = window.handHitboxManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.collision);

    this.protestorHitboxManager =
      window.protestorHitboxManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.protestorHitbox);

    // Find UFO manager
    this.UFOManager = window.UFOManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.ufo);

    // Find speed manager
    this.speedManager = window.speedManager || (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.speed);

  }
  setupKeyBindings() {
    // Remove existing listener if it exists
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null; // Clear the reference
    }
    
    // Create a new bound handler
    this._keydownHandler = (e) => {
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        // console.log("[Debug] D key pressed, toggling panel");
        this.togglePanel();
        return;
      }
  
      if (e.key.toLowerCase() === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this._togglePause();
        return;
      }
  
      // Skip shortcuts while panel is hidden
      if (this.panel.classList.contains('hidden')) return;
      
      // Skip while typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Debug key bindings
      switch (e.key.toLowerCase()) {
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.toggleHitboxVisibility();
          }
          break;
      }
    };
  
    // Add new listener
    document.addEventListener('keydown', this._keydownHandler);
  
}

  /**
   * Start status update timers
   */
  startStatusUpdates() {
    // Resistance status updates
    if (!this.resistanceStatusInterval && this.freedomManager) {
      this.resistanceStatusInterval = setInterval(() => {
        this.updateResistanceStatus();
      }, 500);
    }

  }

  setupResistanceControlsSection() {
    const { content } = this.createSection("resistance", "Resistance & Protestor Controls");
  
    // Country selector
    const countrySelector = document.createElement("select");
    countrySelector.className = "dbg-select";
    countrySelector.style.marginRight = "5px";
    ["canada", "mexico", "greenland", "usa"].forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelector.appendChild(option);
    });
  
    const selectorWrapper = document.createElement("div");
    selectorWrapper.className = "dbg-group";
    selectorWrapper.innerHTML = `<div class="dbg-label">Country: </div>`;
    selectorWrapper.appendChild(countrySelector);
    content.appendChild(selectorWrapper);
  
    // Flag controls
    const flagControls = document.createElement("div");
    flagControls.className = "dbg-group";
  
    const claimsControls = document.createElement("div");
    claimsControls.style.display = "flex";
    claimsControls.style.flexWrap = "wrap";
    claimsControls.style.gap = "5px";
    claimsControls.style.marginTop = "5px";
  
    // Claims buttons (0-3)
    [0, 1, 2, 3].forEach((claims) => {
      const btn = this.createButton(
        `Set ${claims}/3`,
        () => {
          const country = countrySelector.value;
          if (window.freedomManager) {
            window.freedomManager.setCountryClaims(country, claims);
          }
        },
        { small: true }
      );
      claimsControls.appendChild(btn);
    });
  
    flagControls.appendChild(claimsControls);
    content.appendChild(flagControls);
  
    // Protestor controls
    const protestorControls = document.createElement("div");
    protestorControls.className = "dbg-group";
  
    // Show/Hide controls
    const visibilityControls = document.createElement("div");
    visibilityControls.style.display = "flex";
    visibilityControls.style.gap = "5px";
    visibilityControls.style.marginBottom = "10px";
  
    const showProtestorsBtn = this.createButton(
      "Show Protestors",
      () => {
        const country = countrySelector.value;
        if (window.freedomManager) {
          window.freedomManager.showProtestors(country);
        }
      },
      { small: true }
    );
  
    const hideProtestorsBtn = this.createButton(
      "Hide Protestors",
      () => {
        const country = countrySelector.value;
        if (window.freedomManager) {
          window.freedomManager.hideProtestors(country);
        }
      },
      { small: true }
    );
  
    visibilityControls.appendChild(showProtestorsBtn);
    visibilityControls.appendChild(hideProtestorsBtn);
    protestorControls.appendChild(visibilityControls);
  
    // Action controls
    const actionControls = document.createElement("div");
    actionControls.style.display = "flex";
    actionControls.style.flexWrap = "wrap";
    actionControls.style.gap = "5px";
  
    const triggerResistanceBtn = this.createButton(
      "Trigger Resistance",
      () => {
        const country = countrySelector.value;
        if (window.freedomManager) {
          window.freedomManager.triggerCountryResistance(country);
        }
      },
      { small: true }
    );
  
    const cleanupAllBtn = this.createButton(
      "Cleanup All",
      () => {
        if (window.freedomManager) {
          window.freedomManager.cleanupAllProtestors();
        }
      },
      { small: true }
    );
  
    // Size controls
    const sizeControls = document.createElement("div");
    sizeControls.style.display = "flex";
    sizeControls.style.gap = "5px";
    sizeControls.style.marginTop = "5px";
  
    const scaleUpBtn = this.createButton(
      "Scale Up",
      () => {
        const country = countrySelector.value;
        if (window.protestorHitboxManager) {
          window.protestorHitboxManager.updateSize(country, 1.2);
        }
      },
      { small: true }
    );
    
    const resetSizeBtn = this.createButton(
      "Reset Size",
      () => {
        const country = countrySelector.value;
        if (window.protestorHitboxManager) {
          window.protestorHitboxManager.updateSize(country, 1.0);
        }
      },
      { small: true }
    );
  
    actionControls.appendChild(triggerResistanceBtn);
    actionControls.appendChild(cleanupAllBtn);
    sizeControls.appendChild(scaleUpBtn);
    sizeControls.appendChild(resetSizeBtn);
  
    protestorControls.appendChild(actionControls);
    protestorControls.appendChild(sizeControls);
    content.appendChild(protestorControls);

    // Status display
    const resistanceStatus = this.createStatus("resistance-status", "Resistance & protestor status");
    content.appendChild(resistanceStatus);
  
    // Update status periodically
    setInterval(() => this.updateResistanceStatus(), 500);
  }
  
  // Update the status display method
  updateResistanceStatus() {
    if (!window.freedomManager) return;
  
    const statusElement = document.getElementById("resistance-status");
    if (!statusElement) return;
  
    try {
      let statusHTML = "";
  
      // For each country, show resistance status
      Object.keys(window.freedomManager.countries).forEach((country) => {
        const countryData = window.freedomManager.countries[country];
        const gameCountry = this.gameState?.countries?.[country];
  
        statusHTML += `
          <div style="margin-bottom: 5px;">
            <strong>${country}:</strong> 
            ${gameCountry ? `${gameCountry.claims}/${gameCountry.maxClaims} claims` : "Unknown"} |
            Protestors: ${countryData.protestorsShown ? "Shown" : "Hidden"} |
            Click Count: ${countryData.clickCounter || 0}
          </div>
        `;
      });
  
      statusElement.innerHTML = statusHTML;
    } catch (e) {
      statusElement.textContent = "Error updating resistance status: " + e.message;
    }
  }

  /**
   * Stop status update timers
   */
  stopStatusUpdates() {
    if (this.resistanceStatusInterval) {
      clearInterval(this.resistanceStatusInterval);
      this.resistanceStatusInterval = null;
    }
  }

  setupGameControlsSection() {
    const { content } = this.createSection("game", "Game Controls");
  
    // Time control
    const timeControls = document.createElement("div");
    timeControls.className = "dbg-group";
    timeControls.innerHTML = `
      <div class="dbg-label">
        Time:
        <input type="number" id="debug-time-input" class="dbg-input" min="1" max="180" value="${this.gameState?.timeRemaining || 60}">
        sec
      </div>
    `;
  
    const timeButtons = document.createElement("div");
    timeButtons.style.display = "flex";
    timeButtons.style.gap = "5px";
    timeButtons.style.marginTop = "5px";
  
    // Create set time button
    const setTimeBtn = this.createButton(
      "Set Time",
      () => {
        const newTime = parseInt(document.getElementById("debug-time-input").value);
        if (newTime && newTime > 0 && this.gameState) {
          this.gameState.timeRemaining = newTime;
          this._updateGameUI();
        }
      },
      { showEffect: true, small: true }
    );
    timeButtons.appendChild(setTimeBtn);
  
    // Add time buttons
    [30, 60, 120, 168].forEach((seconds) => {
      const btn = this.createButton(
        `${seconds}s`,
        () => {
          if (this.gameState) {
            this.gameState.timeRemaining = seconds;
            document.getElementById("debug-time-input").value = seconds;
            this._updateGameUI();
          }
        },
        { small: true }
      );
      timeButtons.appendChild(btn);
    });
  
    timeControls.appendChild(timeButtons);
    content.appendChild(timeControls);
  
    // Score controls 
    const scoreControls = document.createElement("div");
    scoreControls.className = "dbg-group";
    scoreControls.innerHTML = `
      <div class="dbg-label">
        Score:
        <input type="number" id="debug-score-input" class="dbg-input" min="0" max="9999" value="${this.gameState?.score || 0}">
      </div>
    `;
  
    const setScoreBtn = this.createButton(
      "Set Score",
      () => {
        const newScore = parseInt(document.getElementById("debug-score-input").value);
        if (newScore >= 0 && this.gameState) {
          this.gameState.score = newScore;
          this._updateGameUI();
        }
      },
      { showEffect: true }
    );
    scoreControls.appendChild(setScoreBtn);
    content.appendChild(scoreControls);
  
    // Game flow controls with game end states
    const flowControls = document.createElement("div");
    flowControls.className = "dbg-group";
  
    const startBtn = this.createButton("Start Game", () => {
      if (window.gameEngine?.startGame) {
        window.gameEngine.startGame();
      }
    });
  
    const pauseBtn = this.createButton("Toggle Pause", () => {
      if (window.gameEngine?.togglePause) {
        window.gameEngine.togglePause();
      }
    });
  
    const gameOverBtns = document.createElement("div");
    gameOverBtns.style.display = "flex";
    gameOverBtns.style.gap = "5px";
    gameOverBtns.style.marginTop = "5px";
    gameOverBtns.style.flexWrap = "wrap";
  
    const endStates = {
      "Trump Victory": "trump_victory",
      "Resistance Win": "resistance_win",
      "Trump Destroyed": "trump_destroyed"
    };
  
    Object.entries(endStates).forEach(([label, state]) => {
      const btn = this.createButton(
        label,
        () => {
          if (window.gameEngine?.triggerGameEnd) {
            window.gameEngine.triggerGameEnd(state);
          }
        },
        { className: "dbg-button small" }
      );
      gameOverBtns.appendChild(btn);
    });
  
    const restartBtn = this.createButton("Restart Game", () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('record')) {
        // Load the base game without any parameters
        window.location.href = window.location.pathname;
        // window.location.href = window.location.origin + window.location.pathname;

      } else {
        // Normal restart
        if (window.gameEngine?.restartGame) {
          window.gameEngine.restartGame();
        }
      }
    });
  
    flowControls.appendChild(startBtn);
    flowControls.appendChild(pauseBtn);
    flowControls.appendChild(gameOverBtns);
    flowControls.appendChild(restartBtn);
    content.appendChild(flowControls);
  
    // Game state display
    const stateStatus = this.createStatus("game-state-status", "Game state information");
    content.appendChild(stateStatus);
  
    // Schedule state updates
    setInterval(() => this._updateGameStateDisplay(), 500);
  }
  
  _updateGameStateDisplay() {
    if (!this.gameState) return;
  
    const status = document.getElementById("game-state-status");
    if (!status) return;
  
    const speed = window.speedManager ? window.speedManager.getCurrentSpeed() : { multiplier: 1, name: "Normal" };
  
    status.innerHTML = `
      <div>Playing: ${this.gameState.isPlaying ? "Yes" : "No"}</div>
      <div>Paused: ${this.gameState.isPaused ? "Yes" : "No"}</div>
      <div>Time: ${this.gameState.timeRemaining}s</div>
      <div>Score: ${this.gameState.score}</div>
      <div>Speed: ${speed.multiplier.toFixed(1)}x (${speed.name})</div>
      <div>Tutorial Complete: ${window.speedManager?.state?.tutorialCompleted ? "Yes" : "No"}</div>
      <div>Blocks: ${this.gameState.stats?.successfulBlocks || 0}</div>
      <div>Consecutive Hits: ${this.gameState.consecutiveHits || 0}</div>
      ${this.gameState.gameEnding ? '<div style="color: #f55;">Game Ending: ' + this.gameState.endReason + '</div>' : ''}
    `;
  }

  /**
   * Update game UI
   * @private
   */
  _updateGameUI() {
    // Try different methods to update UI
    if (typeof window.updateHUD === "function") {
      window.updateHUD();
    } else if (window.gameEngine && window.gameEngine.systems && window.gameEngine.systems.ui) {
      window.gameEngine.systems.ui.updateHUD(this.gameState);
      window.gameEngine.systems.ui.updateProgressBar(this.gameState.timeRemaining, this.gameState.config?.GAME_DURATION || 168);
    }
  }

  /**
   * Toggle game pause state
   * @private
   */
  _togglePause() {
    if (window.gameEngine && window.gameEngine.togglePause) {
      window.gameEngine.togglePause();
    } else if (this.gameState) {
      this.gameState.isPaused = !this.gameState.isPaused;

      // Update UI pause button if it exists
      const pauseButton = document.getElementById("pause-button");
      if (pauseButton) {
        pauseButton.setAttribute("aria-pressed", this.gameState.isPaused ? "true" : "false");
      }
    }
  }

  setupHitboxControlsSection() {
    const { content } = this.createSection("hitboxes", "Hitbox Controls");
  
    // Basic hitbox visibility toggle
    const visibilityControls = document.createElement("div");
    visibilityControls.className = "dbg-group";
  
    const toggleHitboxBtn = this.createButton(
      "Toggle Hitboxes",
      () => this.toggleHitboxVisibility(),
      { tooltip: "Toggle hitbox visibility (Ctrl+A)" }
    );
  
    visibilityControls.appendChild(toggleHitboxBtn);
    content.appendChild(visibilityControls);
  }

  toggleHitboxVisibility() {
    document.body.classList.toggle("debug-mode");
    const isDebugMode = document.body.classList.contains("debug-mode");
    
    // Update animation manager if available
    if (this.animationManager) {
      this.animationManager.setDebugMode?.(isDebugMode);
    }
    
    // Placeholder red dot in debug mode
    let hitboxDot = document.getElementById("debug-hitbox-dot");
    if (isDebugMode && !hitboxDot) {
      hitboxDot = document.createElement("div");
      hitboxDot.id = "debug-hitbox-dot";
      hitboxDot.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ea1487;
        border-radius: 50%;
        pointer-events: none;
        display: none;
        z-index: 9999;
      `;
      document.body.appendChild(hitboxDot);
    } else if (!isDebugMode && hitboxDot) {
      hitboxDot.remove();
    }
  }
  
  setupAudioControlsSection() {
    const { content } = this.createSection("audio", "Audio Controls");
  
    // Volume Controls
    const volumeControls = document.createElement("div");
    volumeControls.className = "dbg-group";
    volumeControls.innerHTML = `
      <div class="dbg-label">
        Volume:
        <input type="range" id="debug-volume-slider" min="0" max="1" step="0.1" value="${this.audioManager?.volume || 1}" style="width: 100px;">
        <span id="debug-volume-value">${this.audioManager?.volume || 1}</span>
      </div>
    `;
  
    const volumeSlider = volumeControls.querySelector("#debug-volume-slider");
    const volumeValue = volumeControls.querySelector("#debug-volume-value");
  
    volumeSlider.addEventListener("input", () => {
      const vol = parseFloat(volumeSlider.value);
      volumeValue.textContent = vol.toFixed(1);
  
      if (this.audioManager && typeof this.audioManager.setVolume === "function") {
        this.audioManager.setVolume(vol);
      }
    });
  
    const muteBtn = this.createButton("Toggle Mute", () => {
      if (this.audioManager && typeof this.audioManager.toggleMute === "function") {
        const isMuted = this.audioManager.toggleMute();
        muteBtn.textContent = isMuted ? "Unmute" : "Toggle Mute";
      }
    });
  
    volumeControls.appendChild(muteBtn);
    content.appendChild(volumeControls);

    // Music controls
    const musicControls = document.createElement("div");
    musicControls.className = "dbg-group";
  
    const musicTitle = document.createElement("div");
    musicTitle.textContent = "Background Music:";
    musicTitle.style.marginBottom = "5px";
  
    const startMusicBtn = this.createButton("Start Music", () => {
      if (this.audioManager && typeof this.audioManager.startBackgroundMusic === "function") {
        this.audioManager.startBackgroundMusic();
      }
    });
  
    const stopMusicBtn = this.createButton("Stop Music", () => {
      if (this.audioManager && typeof this.audioManager.stopBackgroundMusic === "function") {
        this.audioManager.stopBackgroundMusic();
      }
    });
  
    const fadeOutBtn = this.createButton("Fade Out Music", () => {
      if (this.audioManager && typeof this.audioManager.fadeTo === "function" && this.audioManager.backgroundMusic) {
        this.audioManager.fadeTo(
          this.audioManager.backgroundMusic,
          0, // Target volume
          2000, // Duration in ms
          () => {
            this.audioManager.stopBackgroundMusic();
          }
        );
      }
    });
  
    musicControls.appendChild(musicTitle);
    musicControls.appendChild(startMusicBtn);
    musicControls.appendChild(stopMusicBtn);
    musicControls.appendChild(fadeOutBtn);
    content.appendChild(musicControls);
  
    // Sound test categories
    const soundCategories = [
      {
        id: "ui",
        name: "UI Sounds",
        sounds: ["click", "gameStart", "gameOver", "win", "lose", "grabWarning", "instruction", "stopHim", "smackThatHand", "faster", "aliens", "musk", "growProtestors"],
      },
      { 
        id: "trump", 
        name: "Trump Sounds", 
        sounds: ["trumpGrabbing", "partialAnnexCry", "trumpSob", "trumpYa", "beenVeryNiceToYou"] 
      },
      { 
        id: "defense", 
        name: "Defense Sounds", 
        sounds: ["slap", "peopleSayNo"] 
      }
    ];
  
    soundCategories.forEach((category) => {
      const categoryControls = document.createElement("div");
      categoryControls.className = "dbg-group";
  
      const categoryTitle = document.createElement("div");
      categoryTitle.textContent = category.name + ":";
      categoryTitle.style.marginBottom = "5px";
  
      const soundButtons = document.createElement("div");
      soundButtons.style.display = "flex";
      soundButtons.style.flexWrap = "wrap";
      soundButtons.style.gap = "5px";
  
      category.sounds.forEach((sound) => {
        const btn = this.createButton(
          sound,
          () => {
            if (this.audioManager) {
              this.audioManager.play(category.id, sound);
            }
          },
          { small: true }
        );
        soundButtons.appendChild(btn);
      });
  
      categoryControls.appendChild(categoryTitle);
      categoryControls.appendChild(soundButtons);
      content.appendChild(categoryControls);
    });
  
    // Country-specific sound tests
    const countrySoundControls = document.createElement("div");
    countrySoundControls.className = "dbg-group";
  
    const countryTitle = document.createElement("div");
    countryTitle.textContent = "Country Sounds:";
    countryTitle.style.marginBottom = "5px";
  
    const countrySelector = document.createElement("select");
    countrySelector.className = "dbg-select";
    countrySelector.style.marginRight = "5px";
    ["eastCanada", "westCanada", "mexico", "greenland"].forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelector.appendChild(option);
    });
  
    const testCatchphraseBtn = this.createButton(
      "Catchphrase",
      () => {
        const country = countrySelector.value;
        if (this.audioManager && typeof this.audioManager.playCatchphrase === "function") {
          this.audioManager.playCatchphrase(country);
        }
      },
      { small: true }
    );
  
    const testProtestBtn = this.createButton(
      "Play Protest",
      () => {
        const country = countrySelector.value;
        if (this.audioManager && typeof this.audioManager.playProtestorSound === "function") {
          // this.audioManager.playProtestorSound(country);
        }
      },
      { small: true }
    );
  
    const stopProtestBtn = this.createButton(
      "Stop Protest",
      () => {
        const country = countrySelector.value;
        if (this.audioManager && typeof this.audioManager.stopProtestorSound === "function") {
          this.audioManager.stopProtestorSound(country);
        }
      },
      { small: true }
    );
  
    countrySoundControls.appendChild(countryTitle);
    countrySoundControls.appendChild(countrySelector);
    countrySoundControls.appendChild(document.createElement("br"));
    countrySoundControls.appendChild(testCatchphraseBtn);
    countrySoundControls.appendChild(testProtestBtn);
    countrySoundControls.appendChild(stopProtestBtn);
    content.appendChild(countrySoundControls);
  
    // Game event sound tests
    const gameEventSounds = document.createElement("div");
    gameEventSounds.className = "dbg-group";
    gameEventSounds.innerHTML = `<div>Game Event Sounds:</div>`;
  
    const successfulBlockBtn = this.createButton("Successful Block", () => {
      if (this.audioManager && typeof this.audioManager.playSuccessfulBlock === "function") {
        this.audioManager.playSuccessfulBlock("mexico");
      }
    });
  
    const successfulGrabBtn = this.createButton("Successful Grab", () => {
      if (this.audioManager && typeof this.audioManager.playSuccessfulGrab === "function") {
        this.audioManager.playSuccessfulGrab("mexico");
      }
    });
    
    const annexBtn = this.createButton("Full Annexation", () => {
      if (this.audioManager && typeof this.audioManager.playCountryFullyAnnexedCry === "function") {
        this.audioManager.playCountryFullyAnnexedCry("mexico");
      }
    });
  
    gameEventSounds.appendChild(successfulBlockBtn);
    gameEventSounds.appendChild(successfulGrabBtn);
    gameEventSounds.appendChild(annexBtn);
    content.appendChild(gameEventSounds);
  
    // Audio system control and status
    const systemControls = document.createElement("div");
    systemControls.className = "dbg-group";
  
    const stopAllBtn = this.createButton("Stop All Sounds", () => {
      if (this.audioManager && typeof this.audioManager.stopAll === "function") {
        this.audioManager.stopAll();
      }
    });
  
    const resetBtn = this.createButton("Reset Audio System", () => {
      if (this.audioManager && typeof this.audioManager.reset === "function") {
        this.audioManager.reset();
      }
    });
  
    systemControls.appendChild(stopAllBtn);
    systemControls.appendChild(resetBtn);
    content.appendChild(systemControls);
  
    // Add audio status display
    const audioStatus = this.createStatus("audio-status", "Audio system status");
    content.appendChild(audioStatus);
  
    // Update status periodically
    setInterval(() => {
      if (!this.audioManager) return;
      
      const status = document.getElementById("audio-status");
      if (!status) return;
  
      status.innerHTML = `
        <div>Context: ${this.audioManager.audioContext?.state || "none"}</div>
        <div>Initialized: ${this.audioManager.initialized ? "Yes" : "No"}</div>
        <div>Muted: ${this.audioManager.muted ? "Yes" : "No"}</div>
        <div>Volume: ${this.audioManager.volume?.toFixed(2) || "1.00"}</div>
        <div>Playing Sounds: ${this.audioManager.currentlyPlaying?.length || 0}</div>
        <div>Music Playing: ${this.audioManager.backgroundMusicPlaying ? "Yes" : "No"}</div>
        <div>Loaded Sounds: ${this.audioManager.loadedSounds?.size || 0}</div>
      `;
    }, 500);
  }

  setupUfoControlsSection() {
    const { content } = this.createSection("ufo", "UFO & Easter Eggs");
  
    // UFO controls
    if (this.UFOManager || window.UFOManager) {
      const ufoControls = document.createElement("div");
      ufoControls.className = "dbg-group";
  
      const showUfoBtn = this.createButton("Show UFO", () => {
        const ufo = this.UFOManager || window.UFOManager;
        if (ufo && typeof ufo.flyUfo === "function") {
          ufo.flyUfo();
        }
      });
  
      const hideUfoBtn = this.createButton("Hide UFO", () => {
        const ufo = this.UFOManager || window.UFOManager;
        if (ufo && this.elements && this.elements.ufo) {
          ufo.elements.ufo.style.opacity = "0";
        }
      });
  
      ufoControls.appendChild(showUfoBtn);
      ufoControls.appendChild(hideUfoBtn);
      content.appendChild(ufoControls);
    }
  
    // Elon appearance
    const elonControls = document.createElement("div");
    elonControls.className = "dbg-group";
  
    const showElonBtn = this.createButton("Show Elon", () => {
      const ufo = this.UFOManager || window.UFOManager;
      if (ufo && typeof ufo.showElonMusk === "function") {
        // true = standalone test, auto-cleanup
        ufo.showElonMusk(true);
  
        // Play sound if available
        if (this.audioManager) {
          this.audioManager.play("ui", "musk");
        }
      }
    });
  
    const cleanupElonBtn = this.createButton("Clean Up Elon", () => {
      const ufo = this.UFOManager || window.UFOManager;
      if (ufo) {
        if (typeof ufo.cleanupElonMusk === "function") {
          ufo.cleanupElonMusk();
        } else if (typeof ufo.cleanupElonElements === "function") {
          ufo.cleanupElonElements({ withTumble: true });
          ufo.removeElonHitbox && ufo.removeElonHitbox();
        }
      }
    });
  
    elonControls.appendChild(showElonBtn);
    elonControls.appendChild(cleanupElonBtn);
    content.appendChild(elonControls);
  
    // Aliens sound effect
    const aliensControls = document.createElement("div");
    aliensControls.className = "dbg-group";
  
    const playAliensBtn = this.createButton("Play Aliens Sound", () => {
      if (this.audioManager) {
        if (typeof this.audioManager.resumeAudioContext === "function") {
          this.audioManager.resumeAudioContext().then(() => {
            this.audioManager.play("ui", "aliens", 0.8);
          });
        } else {
          this.audioManager.play("ui", "aliens", 0.8);
        }
      }
    });
  
    aliensControls.appendChild(playAliensBtn);
    content.appendChild(aliensControls);
  
    // Add extra options for debugging
    const debugOptions = document.createElement("div");
    debugOptions.className = "dbg-group";
  
    const checkOrphanedBtn = this.createButton("Check Orphaned Elon Elements", () => {
      const ufo = this.UFOManager || window.UFOManager;
      if (ufo && typeof ufo.cleanupOrphanedElements === "function") {
        ufo.cleanupOrphanedElements();
      } else {
        // Fallback cleanup logic
        document.querySelectorAll('[id*="elon"]').forEach(el => {
          if (el && el.parentNode) {
            console.log(`Found and removing orphaned element: ${el.id}`);
            el.parentNode.removeChild(el);
          }
        });
      }
    });
  
    debugOptions.appendChild(checkOrphanedBtn);
    content.appendChild(debugOptions);
  
    // Add UFO Status display
    if (this.UFOManager || window.UFOManager) {
      const ufoStatus = this.createStatus("ufo-status", "UFO status information");
      content.appendChild(ufoStatus);
  
      // Update UFO status periodically
      setInterval(() => {
        const ufo = this.UFOManager || window.UFOManager;
        if (!ufo) return;
        
        const status = document.getElementById("ufo-status");
        if (!status) return;
  
        // Check if Elon elements exist
        const elonExists = !!document.getElementById("elon-sprite") || 
                            !!document.getElementById("elon-wrapper") ||
                            !!document.getElementById("elon-hitbox");
  
        status.innerHTML = `
          <div>Auto Spawn: ${ufo.state?.autoSpawnEnabled ? "Enabled" : "Disabled"}</div>
          <div>Animating: ${ufo.state?.isAnimating ? "Yes" : "No"}</div>
          <div>Elon Visible: ${elonExists ? "Yes" : "No"}</div>
          <div>UFO Visible: ${ufo.elements?.ufo?.style.opacity !== "0" ? "Yes" : "No"}</div>
        `;
      }, 500);
    }
  }

  setupPerformanceControlsSection() {
    const { content } = this.createSection("performance", "Performance Controls");
  
    // Debug class toggle
    const debugModeControls = document.createElement("div");
    debugModeControls.className = "dbg-group";
  
    const toggleDebugClassBtn = this.createButton("Toggle Debug Class", () => {
      document.body.classList.toggle("debug-mode");
    });
  
    debugModeControls.appendChild(toggleDebugClassBtn);
    content.appendChild(debugModeControls);

    // Browser info
    const infoControls = document.createElement("div");
    infoControls.className = "dbg-group";
  
    // Collect browser and device info
    const isMobile = window.DeviceUtils?.isMobileDevice || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    const isTouchDevice =
      window.DeviceUtils?.isTouchDevice || "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  
    infoControls.innerHTML = `
      <div><strong>Browser:</strong> ${navigator.userAgent.split(/[()]/)[1] || navigator.userAgent}</div>
      <div><strong>Device:</strong> ${isMobile ? "Mobile" : "Desktop"} / ${isTouchDevice ? "Touch" : "No Touch"}</div>
      <div><strong>Viewport:</strong> ${viewportWidth}×${viewportHeight}</div>
      <div><strong>Chrome Mobile:</strong> ${window.isChromeOnMobile ? "Yes" : "No"}</div>
    `;
  
    content.appendChild(infoControls);

    // Clear cache and reload
    const cacheControls = document.createElement("div");
    cacheControls.className = "dbg-group";
  
    const reloadBtn = this.createButton("Reload Page", () => {
      window.location.reload();
    });
  
    const hardReloadBtn = this.createButton(
      "Hard Reload (Clear Cache)",
      () => {
        window.location.reload(true);
      },
      { className: "dbg-button warning" }
    );
  
    cacheControls.appendChild(reloadBtn);
    cacheControls.appendChild(hardReloadBtn);
    content.appendChild(cacheControls);
  }
  
}

// Make the DebugManager globally available
window.DebugManager = DebugManager;
