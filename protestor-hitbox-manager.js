/**
 * Shared utility functions for hitbox management
 */

const HitboxUtils = {
  /**
   * Position an element using coordinates
   * @param {HTMLElement} element - Element to position
   * @param {Object} coords - Coordinates object with x, y, width, height
   * @param {Object} styles - Optional additional styles to apply
   * @returns {boolean} Success status
   */
  positionElement(element, coords, styles = {}) {
    if (!element) return false;

    // Position the element
    element.style.position = "absolute";
    element.style.left = `${coords.x}px`;
    element.style.top = `${coords.y}px`;
    element.style.width = `${coords.width}px`;
    element.style.height = `${coords.height}px`;

    // Apply additional styles
    Object.entries(styles).forEach(([prop, value]) => {
      element.style[prop] = value;
    });

    return true;
  },

  /**
   * @param {HTMLElement} mapElement - Map element
   * @param {number} referenceScale - Reference scale
   * @returns {number} Scale factor
   */
  calculateScaleFactor(mapElement, referenceScale = 1.0) {
    if (!mapElement) return 1.0;

    const currentMapScale = mapElement.clientWidth / mapElement.naturalWidth;
    return currentMapScale / referenceScale;
  },

  /**
   * Apply debug visual style to an element
   * @param {HTMLElement} element - Element to style
   * @param {boolean} enabled - Whether debug mode is enabled
   */
  applyDebugVisuals(element, enabled) {
    if (!element) return;

    if (enabled) {
    } else {
      element.style.border = "none";
      element.style.backgroundColor = "transparent";
    }
  },

  /**
   * @param {HTMLElement} element - Element to attach events to
   * @param {Object} handlers - Map of event types to handler functions
   * @returns {HTMLElement} The new element with attached handlers
   */
  setupEventHandlers(element, handlers) {
    if (!element) return null;

    const newElement = element.cloneNode(true);
    if (element.parentNode) {
      element.parentNode.replaceChild(newElement, element);
    }

    // Add new handlers to the clone
    Object.entries(handlers).forEach(([event, handler]) => {
      newElement.addEventListener(event, handler);
    });

    return newElement;
  },

  /**
   * Remove click here prompt and related elements
   */
  removeClickPrompt() {
    // Remove trump-hand-click-prompt
    const prompt = document.getElementById("trump-hand-click-prompt");
    if (prompt && prompt.parentNode) {
      prompt.parentNode.removeChild(prompt);
    }

    // Also remove any .hitbox-prompt elements
    const hitbox = document.getElementById("trump-hand-hitbox");
    if (hitbox) {
      const existingPrompts = hitbox.querySelectorAll(".hitbox-prompt");
      existingPrompts.forEach((prompt) => prompt.remove());
    }

    // Remove style elements
    const handPromptStyle = document.getElementById("hand-prompt-style");
    if (handPromptStyle) handPromptStyle.remove();

    const hitboxPromptStyle = document.getElementById("hitbox-prompt-style");
    if (hitboxPromptStyle) hitboxPromptStyle.remove();
  },
};

/**
 * Manages hitboxes for protestors in the game
 */

class ProtestorHitboxManager {
  /**
   * Create a new ProtestorHitboxManager
   * @param {boolean} lazyInit - Whether to use lazy initialization
   */
  constructor(lazyInit = false) {
    logger.info("protestor-hitbox", "Creating Protestor Hitbox Manager");

    // State tracking
    this.protestorHitboxes = {
      canada: { element: null, isVisible: false, scale: 1.0 },
      mexico: { element: null, isVisible: false, scale: 1.0 },
      greenland: { element: null, isVisible: false, scale: 1.0 },
      usa: { element: null, isVisible: false, scale: 1.0 }, // Add USA
    };

    this.isDebugMode = false;
    this.lazyInit = lazyInit; // Store lazy init flag

    this.mapElement = document.getElementById("map-background");

    this.spawnLocations = {
      canada: [
        {
          x: 590, //wh
          y: 1020,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 408, //daw
          y: 900,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 891, //nwt checked
          y: 900,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 2326, //nl
          y: 1750,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
      ],

      usa: [
        {
          x: 400, // Seattle area
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 500, // Seattle area
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 600,
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 700,
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 700,
          y: 2100,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 700,
          y: 2200,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 430,
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 460,
          y: 2100,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 560,
          y: 2200,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 700, // Minnesota area
          y: 2000,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 1400, // pits  area
          y: 2100,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 600, // California area
          y: 2200,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 1440,
          y: 2200,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 1640,
          y: 2200,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
      ],
      mexico: [
        {
          x: 850,
          y: 2410,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
      ],
      greenland: [
        {
          x: 1900,
          y: 377,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 2000,
          y: 377,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },

        {
          x: 2200,
          y: 377,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 2400,
          y: 377,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 2192,
          y: 577,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
        {
          x: 2080,
          y: 520,
          width: 300,
          height: 300,
          calibrationScale: 0.24,
        },
      ],
    };

    // Store currently selected coordinates for each country
    this.currentCoordinates = {};

    // Reference to the currently associated freedom manager
    this.freedomManager = null;

    if (!lazyInit) {
      this.init();
    } else {
      // Just create container, don't create hitboxes yet
      this.ensureHitboxContainer();
      this.selectRandomSpawnLocations();
    }
  }

  /**
   * Initialize hitboxes
   */
  init() {
    // logger.debug("protestor-hitbox", "Initializing protestor hitboxes");

    this.ensureHitboxContainer();

    // Select random spawn locations for each country
    this.selectRandomSpawnLocations();

    if (!this.lazyInit) {
      Object.keys(this.protestorHitboxes).forEach((countryId) => {
        this.createHitbox(countryId);
      });
    }

    // Check if debug mode is enabled
    this.isDebugMode = document.body.classList.contains("debug-mode");

    // Set up resize listener
    window.addEventListener("resize", () => this.repositionAllHitboxes());
  }

  /**
   * Select random spawn locations for all countries
   */
  selectRandomSpawnLocations() {
    Object.keys(this.spawnLocations).forEach((countryId) => {
      const locations = this.spawnLocations[countryId];
      if (locations && locations.length > 0) {
        // Select a random location from the array
        const randomIndex = Math.floor(Math.random() * locations.length);
        this.currentCoordinates[countryId] = locations[randomIndex];

      }
    });
  }

  /**
   * Ensure the hitbox container exists
   * @returns {HTMLElement} The hitbox container
   */
  ensureHitboxContainer() {
    let container = document.getElementById("protestor-hitboxes-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "protestor-hitboxes-container";
      container.style.position = "absolute";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";
      container.style.zIndex = "4"; // Should match FreedomManager.Z_INDEXES.PROTESTORS

      // Add to game container
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        gameContainer.appendChild(container);
        // logger.debug("protestor-hitbox", "Created protestor hitboxes container");
      } else {
        logger.error("protestor-hitbox", "Game container not found, cannot create hitbox container");
      }
    }

    this.container = container;
    return container;
  }

  /**
   * Create a hitbox for a specific country
   * @param {string} countryId - Country identifier
   * @returns {HTMLElement} The created hitbox
   */
  createHitbox(countryId) {
    // Clean up any existing hitbox first
    this.removeHitbox(countryId);

    // Create new hitbox element
    const hitbox = document.createElement("div");
    hitbox.id = `${countryId}-protestor-hitbox`;
    hitbox.className = "protestor-hitbox";
    hitbox.style.position = "absolute";
    hitbox.style.pointerEvents = "all";
    hitbox.style.cursor = "pointer";
    hitbox.style.display = "none"; // Start hidden

    hitbox.setAttribute("role", "button");
    hitbox.setAttribute("aria-label", `Support ${countryId.charAt(0).toUpperCase() + countryId.slice(1)} protestors`);

    // Add debug styling if in debug mode
    if (this.isDebugMode) {
      HitboxUtils.applyDebugVisuals(hitbox, true);
    }

    // Store reference to the element
    this.protestorHitboxes[countryId].element = hitbox;
    this.protestorHitboxes[countryId].scale = 1.0; // Reset scale

    // Add to container
    if (this.container) {
      this.container.appendChild(hitbox);
      logger.debug("protestor-hitbox", `Created protestor hitbox for ${countryId}`);
    }

    return hitbox;
  }

  /**
   * Remove a specific country's hitbox
   * @param {string} countryId - Country identifier
   */
  removeHitbox(countryId) {
    const existingHitbox = this.protestorHitboxes[countryId].element;
    if (existingHitbox && existingHitbox.parentNode) {
      existingHitbox.parentNode.removeChild(existingHitbox);
      logger.debug("protestor-hitbox", `Removed existing protestor hitbox for ${countryId}`);
    }
    this.protestorHitboxes[countryId].element = null;
    this.protestorHitboxes[countryId].isVisible = false;
    this.protestorHitboxes[countryId].scale = 1.0;
  }

  /**
   * Show a hitbox for a specific country
   * @param {string} countryId - Country identifier
   * @param {Object} freedomManager - Freedom manager reference
   * @returns {HTMLElement|null} The hitbox or null if failed
   */
  showHitbox(countryId, freedomManager) {
    if (!this.protestorHitboxes[countryId]) {
      console.error(`[HITBOX ERROR] Invalid country ID: ${countryId}`);
      logger.error("protestor-hitbox", `Invalid country ID: ${countryId}`);
      return null;
    }

    // Reference to freedom manager for click handling
    this.freedomManager = freedomManager;

    // Create or ensure hitbox exists
    let hitbox = this.protestorHitboxes[countryId].element;
    if (!hitbox) {
      hitbox = this.createHitbox(countryId);
    }

    // Position the hitbox
    this.positionHitbox(countryId);

    // Make it visible
    hitbox.style.display = "block";
    this.protestorHitboxes[countryId].isVisible = true;

    this.setClickHandler(countryId, hitbox, freedomManager);

    const wrapper = document.getElementById(`${countryId}-protestors-wrapper`);
    if (wrapper) {
      console.log(`777 Hitbox shown for ${countryId}, wrapper exists`);
    } else {
      console.log(`777 Hitbox shown for ${countryId}, but wrapper doesn't exist yet`);
    }
    return hitbox;
  }

  /**
   * Hide a specific country's hitbox
   * @param {string} countryId - Country identifier
   */
  hideProtestorHitbox(countryId) {
    const hitboxInfo = this.protestorHitboxes[countryId];
    if (hitboxInfo && hitboxInfo.element) {
      hitboxInfo.element.style.display = "none";
      hitboxInfo.isVisible = false;
      logger.debug("protestor-hitbox", `Hidden protestor hitbox for ${countryId}`);
    }
  }

  /**
   * @param {string} countryId - Country identifier
   */
  positionHitbox(countryId) {
    const hitbox = this.protestorHitboxes[countryId].element;
    if (!hitbox) return;

    // Get the current coordinates for this country
    const baseCoords = this.currentCoordinates[countryId];
    if (!baseCoords) {
      logger.error("protestor-hitbox", `No coordinates defined for ${countryId}`);
      return;
    }

    // Get the map element
    const mapElement = document.getElementById("map-background");
    if (!mapElement) {
      logger.error("protestor-hitbox", "Map element not found");
      return;
    }

    // Get the game container
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      logger.error("protestor-hitbox", "Game container not found");
      return;
    }

    // Get container positions
    const mapRect = mapElement.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // Calculate map offset
    const mapOffsetX = mapRect.left - containerRect.left;
    const mapOffsetY = mapRect.top - containerRect.top;

    // Calculate scale
    const currentMapScale = mapRect.width / mapElement.naturalWidth;
    const hitboxScale = this.protestorHitboxes[countryId].scale || 1.0;

    // Scale and position the hitbox
    const scaledX = baseCoords.x * currentMapScale;
    const scaledY = baseCoords.y * currentMapScale;
    const scaledWidth = baseCoords.width * currentMapScale * hitboxScale;
    const scaledHeight = baseCoords.height * currentMapScale * hitboxScale;

    // Center adjustment for growing hitbox
    const widthDiff = (scaledWidth - baseCoords.width * currentMapScale) / 2;
    const heightDiff = (scaledHeight - baseCoords.height * currentMapScale) / 2;

    // Calculate final position
    const finalX = mapOffsetX + scaledX - widthDiff;
    const finalY = mapOffsetY + scaledY - heightDiff;

    // Position the hitbox using the utility function
    HitboxUtils.positionElement(hitbox, {
      x: finalX,
      y: finalY,
      width: scaledWidth,
      height: scaledHeight,
    });

    logger.debug(
      "protestor-hitbox",
      `Positioned protestor hitbox for ${countryId} at map-relative (${scaledX}, ${scaledY}), absolute (${finalX}, ${finalY})`
    );
  }

  /**
   * Calculate scale factor for a specific country
   * @param {string} countryId - Country identifier
   * @returns {number} Scale factor
   */
  calculateScaleFactor(countryId) {
    if (!this.mapElement) {
      logger.error("protestor-hitbox", "Map element not found for scaling calculation");
      return 1.0;
    }

    const currentMapScale = this.mapElement.clientWidth / this.mapElement.naturalWidth;

    const baseCoords = this.currentCoordinates[countryId];
    const referenceScale = baseCoords.calibrationScale || 1.0;

    // Calculate the adjustment needed
    const scaleFactor = currentMapScale / referenceScale;

    // Add detailed logging

    return scaleFactor;
  }

  /**
   * Set up click handler for a hitbox
   * @param {string} countryId - Country identifier
   * @param {HTMLElement} hitbox - The hitbox element
   * @param {Object} freedomManager - Freedom manager reference
   */
  setClickHandler(countryId, hitbox, freedomManager) {
    // Define the click handler
    const clickHandler = (event) => {
      event.stopPropagation();
      this.logClick("Click/Touch", event, hitbox, countryId);

      if (freedomManager && typeof freedomManager.handleProtestorClick === "function") {
        freedomManager.handleProtestorClick(countryId);
      } else {
        logger.error("protestor-hitbox", "Freedom manager or handler function not available");
      }
    };

    // Utility sets up handlers via clone technique
    const newHitbox = HitboxUtils.setupEventHandlers(hitbox, {
      click: clickHandler,
      touchstart: (event) => {
        event.preventDefault();
        event.stopPropagation();
        clickHandler(event);
      },
    });

    // Update reference to the new hitbox element
    this.protestorHitboxes[countryId].element = newHitbox;
  }

  /**
   * Log click information for debugging
   * @param {string} eventName - Name of the event
   * @param {Event} event - Event object
   * @param {HTMLElement} hitbox - Hitbox element
   * @param {string} countryId - Country identifier
   */
  logClick(eventName, event, hitbox, countryId) {
    logger.info("protestor-hitbox", `${eventName} detected on protestor hitbox for ${countryId}`);

    // Log position data for debugging
    const rect = hitbox.getBoundingClientRect();
    const x = event.clientX || (event.touches && event.touches[0].clientX) || 0;
    const y = event.clientY || (event.touches && event.touches[0].clientY) || 0;

    logger.debug("protestor-hitbox", `Click coordinates: (${x}, ${y}), Hitbox: (${rect.left}, ${rect.top}, ${rect.width}, ${rect.height})`);

    // Check if click is within the bounds
    const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    logger.debug("protestor-hitbox", `Click inside hitbox: ${isInside}`);
  }

  /**
   * Update the size of a hitbox
   * @param {string} countryId - Country identifier
   * @param {number} scaleFactor - Scale factor to apply
   */
  updateSize(countryId, scaleFactor) {
    // Update the scale for this country
    const currentScale = this.protestorHitboxes[countryId].scale || 1.0;
    this.protestorHitboxes[countryId].scale = currentScale * scaleFactor;

    logger.debug("protestor-hitbox", `Updating scale for ${countryId} from ${currentScale} to ${this.protestorHitboxes[countryId].scale}`);

    // Reposition based on the new scale
    this.positionHitbox(countryId);
  }

  /**
   * Set debug mode
   * @param {boolean} enabled - Whether debug mode is enabled
   */
  setDebugMode(enabled) {
    this.isDebugMode = enabled;

    // Update all existing hitboxes
    Object.keys(this.protestorHitboxes).forEach((countryId) => {
      const hitbox = this.protestorHitboxes[countryId].element;
      if (!hitbox) return;

      HitboxUtils.applyDebugVisuals(hitbox, enabled);
    });

    logger.debug("protestor-hitbox", `Debug mode ${enabled ? "enabled" : "disabled"} for protestor hitboxes`);
  }

  /**
   * Reposition all visible hitboxes
   */
  repositionAllHitboxes() {
    Object.keys(this.protestorHitboxes).forEach((countryId) => {
      if (this.protestorHitboxes[countryId].isVisible) {
        this.positionHitbox(countryId);
      }
    });

    // Sync visible sprites with just-moved hitboxes
    this.freedomManager?.repositionAllProtestors?.();

    logger.debug("protestor-hitbox", "Repositioned all visible protestor hitboxes");
  }

  /**
   * Clean up all hitboxes
   */
  cleanupAll() {
    // Remove all hitbox elements
    Object.keys(this.protestorHitboxes).forEach((countryId) => {
      const hitbox = this.protestorHitboxes[countryId];
      if (hitbox && hitbox.element && hitbox.element.parentNode) {
        hitbox.element.parentNode.removeChild(hitbox.element);
      }
    });

    // Reset hitbox data
    this.protestorHitboxes = {
      canada: { element: null, isVisible: false, scale: 1.0 },
      mexico: { element: null, isVisible: false, scale: 1.0 },
      greenland: { element: null, isVisible: false, scale: 1.0 },
      usa: { element: null, isVisible: false, scale: 1.0 }, // Add USA here too
    };

    // Clear any click handlers
    if (this._clickHandler) {
      document.removeEventListener("click", this._clickHandler);
    }

    logger.info("protestor-hitbox", "Cleaned up all protestor hitboxes");
  }

  pause() {
    // Disable hitbox interactions TODO
    this.isPaused = true;
  }

  resume() {
    // Re-enable hitbox interactions TODO
    this.isPaused = false;
  }

  /**
   * Reset the manager
   */
  reset() {
    // Clean up existing hitboxes
    this.cleanupAll();

    // Reselect random spawn locations
    this.selectRandomSpawnLocations();

    // Reset state variables
    this.freedomManager = null;

    // Reinitialize core functionality if needed
    if (!this.lazyInit) {
      Object.keys(this.protestorHitboxes).forEach((countryId) => {
        this.createHitbox(countryId);
      });
    }

    logger.info("protestor-hitbox", "Reset protestor hitbox manager");
  }

  /**
   * Completely destroy the manager
   */
  destroy() {
    // Comprehensive cleanup
    this.cleanupAll();

    // Remove container if it exists
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Reset all tracking variables
    this.container = null;
    this.currentCoordinates = {};
    this.freedomManager = null;
  }
}

window.ProtestorHitboxManager = ProtestorHitboxManager;
