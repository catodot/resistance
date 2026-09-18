window.DEBUG_DISABLE = {
  particles: false, // confetti + fireworks
  resistanceText: true, // "COUNTRY LIBERATED" popup
  flash: true, // currently invisible anyway
  screenShake: true,
  glowPulse: true, // protestor glow outline
  protestorSpriteAnim: true,
};

// In setupEventHandlers function
function setupEventHandlers(element, handlers) {
  if (!element) return false;

  const newElement = element.cloneNode(true);
  if (element.parentNode) {
      element.parentNode.replaceChild(newElement, element);
  }

  Object.entries(handlers).forEach(([event, handler]) => {
      // Add passive option for touch events
      const options = ['touchstart', 'touchmove', 'touchend'].includes(event) 
          ? { passive: true, capture: false } 
          : false;
      
      newElement.addEventListener(event, handler, options);
  });

  return newElement;
}

// Initialize the game when document is ready
document.addEventListener("DOMContentLoaded", function () {
  // console.log("Initializing game...");

  // Create and initialize game engine
  const engine = new GameEngine({
    debug: true,
  });

  engine.init();

  // Global access for debugging
  window.gameEngine = engine;

  if (new URLSearchParams(window.location.search).has("showmouths")) {
    const revealMouths = () => {
      const mapElement = document.getElementById("map-background");
      if (!mapElement || !mapElement.complete || !mapElement.naturalWidth) {
        setTimeout(revealMouths, 200);
        return;
      }
      ["westCanada", "eastCanada", "mexico", "greenland"].forEach((country) => {
        engine._showLipsAnimation(country, 24 * 60 * 60 * 1000);
      });
    };

    document.getElementById("start-button")?.click();
    setTimeout(revealMouths, 300);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("record")) {
    // Hide intro screen
    document.getElementById("intro-screen").classList.add("hidden");

    // Directly show game over screen without animations
    if (window.gameEngine) {
      // Skip animations and flash effects
      window.gameEngine.systems.state.gameEnding = true;
      window.gameEngine.systems.state.isPlaying = false;

      // Show game over screen directly
      window.gameEngine.systems.ui.showGameOverScreen(true, window.gameEngine.systems.state);

      // Show recorder after a slight delay
      setTimeout(() => {
        openVoiceRecordingInterface();
      }, 500);
    } else {
      // Wait briefly if game engine isn't ready
      setTimeout(() => {
        window.gameEngine.systems.state.gameEnding = true;
        window.gameEngine.systems.state.isPlaying = false;
        window.gameEngine.systems.ui.showGameOverScreen(true, window.gameEngine.systems.state);
        setTimeout(() => {
          openVoiceRecordingInterface();
        }, 500);
      }, 100);
    }
  }
});

document.addEventListener("click", function (event) {
  const trumpHandHitbox = document.getElementById("trump-hand-hitbox");
  const trumpHandVisual = document.getElementById("trump-hand-visual");
  const protestorHitboxes = document.querySelectorAll('[id$="-protestor-hitbox"]');

  const isClickInTrumpHitbox = trumpHandHitbox
    ? event.clientX >= trumpHandHitbox.getBoundingClientRect().left &&
      event.clientX <= trumpHandHitbox.getBoundingClientRect().right &&
      event.clientY >= trumpHandHitbox.getBoundingClientRect().top &&
      event.clientY <= trumpHandHitbox.getBoundingClientRect().bottom
    : false;

  const protestorHitboxIntersections = Array.from(protestorHitboxes).map((hitbox) => {
    const rect = hitbox.getBoundingClientRect();
    const isIntersecting = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;

    return {
      id: hitbox.id,
      isIntersecting,
      rect,
    };
  });
});

document.addEventListener("click", function (event) {
  // Get the map element
  const mapElement = document.getElementById("map-background");
  if (!mapElement) return;

  // Get the game container
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  // Get container positions
  const mapRect = mapElement.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  // Get the current map scale
  const currentMapScale = mapRect.width / mapElement.naturalWidth;

  // Calculate click position relative to the container
  const clickX = event.clientX - containerRect.left;
  const clickY = event.clientY - containerRect.top;

  // Convert to natural coords via scale
  const naturalX = Math.round((clickX - (mapRect.left - containerRect.left)) / currentMapScale);
  const naturalY = Math.round((clickY - (mapRect.top - containerRect.top)) / currentMapScale);

  // Log with the POSPOS prefix
  console.log(`POSPOS x: ${naturalX} y: ${naturalY}`);
});
