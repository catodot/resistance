class AnimationManager {
  constructor() {
    // Main DOM elements
    this.trumpSprite = document.getElementById("trump-sprite");

    this._lastAnimationUpdate = Date.now();
    this._stateMonitorInterval = null;
    this._stuckStateTimeout = 8000; // Max time an animation should take
    
    // Animation state tracking
    this.currentState = "idle";
    this.currentFrame = 0;
    this.animationInterval = null;
    this.onAnimationEnd = null;
    this.loopCount = 0;
    this.isPaused = false;
    this.debug = false;

    // Speed control
    this.gameSpeed = 1.0;
    this.baseFrameDuration = 300; // Base duration for animations in ms

    this.currentSizeVariant = "normal"; // Track the current size globally
    this.sizeTransitionInProgress = false;

    // Create hand hitbox manager
    if (typeof HandHitboxManager === "function" && !this.handHitboxManager) {
      // Pass this.audioManager to HandHitboxManager constructor
      this.handHitboxManager = new HandHitboxManager(this.audioManager);
    }
    // Create an overlay element for slap animations
    this.createOverlayElement();


    this.animations = {
      idle: {
        spriteSheet: "images/trump-idle-sprite.png",
        frameCount: 2,
        loopCount: Infinity,
        handVisible: false,
        priority: 1, // Highest priority - needed immediately
      },

      grabEastCanada: {
        spriteSheet: "images/trump-grab-east-canada-sprite.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1608, y: 1439, width: 737, height: 737 }, // Frame 0
          { x: 1469, y: 1344, width: 737, height: 737 }, // Frame 1
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackEastCanada",
        priority: 2,
      },

      grabWestCanada: {
        spriteSheet: "images/trump-grab-west-canada-sprite.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 286, y: 1248, width: 737, height: 737 }, // Frame 0
          { x: 282, y: 1140, width: 737, height: 737 }, // Frame 1
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackWestCanada",
        priority: 2,
      },

      grabGreenland: {
        spriteSheet: "images/trump-grab-greenland-sprite.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 2163, y: 754, width: 737, height: 737 }, // Frame 0
          { x: 2072, y: 789, width: 737, height: 737 }, // Frame 1
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackGreenland",
        priority: 2,
      },

      grabMexico: {
        spriteSheet: "images/trump-grab-mexico-sprite.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1158, y: 2359, width: 737, height: 737 }, // Frame 0
          { x: 946, y: 2485, width: 737, height: 737 }, // Frame 1
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackMexico",
        priority: 2,
      },

      slapped: {
        spriteSheet: "images/trump-slapped-sprite.png",
        frameCount: 2,
        loopCount: 4, // Increased from 2 for better visibility
        handVisible: false,
        priority: 2,
      },
      victory: {
        spriteSheet: "images/trump-happy-sprite.png",
        frameCount: 2,
        loopCount: 4, // Increased from 2 for better visibility
        handVisible: false,
        priority: 2,
      },

      // Smack animations
      smackEastCanada: {
        spriteSheet: "images/smack-east-canada-sprite.png",
        frameCount: 5,
        frameDuration: 120, // Faster animation (120ms per frame)
        handVisible: false,
        priority: 3,
      },
      smackWestCanada: {
        spriteSheet: "images/smack-west-canada-sprite.png",
        frameCount: 5,
        frameDuration: 120,
        handVisible: false,
        priority: 3,
      },
      smackMexico: {
        spriteSheet: "images/smack-mexico-sprite.png",
        frameCount: 5,
        frameDuration: 120,
        handVisible: false,
        priority: 3,
      },
      smackGreenland: {
        spriteSheet: "images/smack-greenland-sprite.png",
        frameCount: 5,
        frameDuration: 120,
        handVisible: false,
        priority: 3,
      },
      muskAppearance: {
        spriteSheet: "images/musk.png",
        frameCount: 2, // If it's a single image
        loopCount: 4, // Play once
        handVisible: false,
        priority: 3,
      },

      // Small size variants
      idleSmall: {
        spriteSheet: "images/trump-idle-sprite-small.png",
        frameCount: 2,
        loopCount: Infinity,
        handVisible: false,
        priority: 3,
      },
      grabEastCanadaSmall: {
        spriteSheet: "images/trump-grab-east-canada-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1608, y: 1439, width: 737, height: 737 },
          { x: 1469, y: 1344, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackEastCanada",
        priority: 3,
      },
      grabWestCanadaSmall: {
        spriteSheet: "images/trump-grab-west-canada-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 286, y: 1248, width: 737, height: 737 },
          { x: 282, y: 1140, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackWestCanada",
        priority: 3,
      },
      grabGreenlandSmall: {
        spriteSheet: "images/trump-grab-greenland-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 2163, y: 754, width: 737, height: 737 },
          { x: 2072, y: 789, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackGreenland",
        priority: 3,
      },
      grabMexicoSmall: {
        spriteSheet: "images/trump-grab-mexico-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1118, y: 2319, width: 737, height: 737 },
          { x: 906, y: 2445, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackMexico",
        priority: 3,
      },
      slappedSmall: {
        spriteSheet: "images/trump-slapped-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },
      victorySmall: {
        spriteSheet: "images/trump-happy-sprite-small.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },

      // Smaller size variants
      idleSmaller: {
        spriteSheet: "images/trump-idle-sprite-smaller.png",
        frameCount: 2,
        loopCount: Infinity,
        handVisible: false,
        priority: 3,
      },
      grabEastCanadaSmaller: {
        spriteSheet: "images/trump-grab-east-canada-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1608, y: 1439, width: 737, height: 737 },
          { x: 1469, y: 1344, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackEastCanada",
        priority: 3,
      },
      grabWestCanadaSmaller: {
        spriteSheet: "images/trump-grab-west-canada-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 286, y: 1248, width: 737, height: 737 },
          { x: 282, y: 1140, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackWestCanada",
        priority: 3,
      },
      grabGreenlandSmaller: {
        spriteSheet: "images/trump-grab-greenland-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 2163, y: 754, width: 737, height: 737 },
          { x: 2072, y: 789, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackGreenland",
        priority: 3,
      },
      grabMexicoSmaller: {
        spriteSheet: "images/trump-grab-mexico-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1118, y: 2319, width: 737, height: 737 },
          { x: 906, y: 2445, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackMexico",
        priority: 3,
      },
      slappedSmaller: {
        spriteSheet: "images/trump-slapped-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },
      victorySmaller: {
        spriteSheet: "images/trump-happy-sprite-smaller.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },

      // Smallest size variants
      idleSmallest: {
        spriteSheet: "images/trump-idle-sprite-smallest.png",
        frameCount: 2,
        loopCount: Infinity,
        handVisible: false,
        priority: 3,
      },
      grabEastCanadaSmallest: {
        spriteSheet: "images/trump-grab-east-canada-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1608, y: 1439, width: 737, height: 737 },
          { x: 1469, y: 1344, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackEastCanada",
        priority: 3,
      },
      grabWestCanadaSmallest: {
        spriteSheet: "images/trump-grab-west-canada-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 286, y: 1248, width: 737, height: 737 },
          { x: 282, y: 1140, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackWestCanada",
        priority: 3,
      },
      grabGreenlandSmallest: {
        spriteSheet: "images/trump-grab-greenland-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 2163, y: 754, width: 737, height: 737 },
          { x: 2072, y: 789, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackGreenland",
        priority: 3,
      },
      grabMexicoSmallest: {
        spriteSheet: "images/trump-grab-mexico-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: true,
        handCoordinates: [
          { x: 1118, y: 2319, width: 737, height: 737 },
          { x: 906, y: 2445, width: 737, height: 737 },
        ],
        calibrationScale: 0.23,
        smackAnimation: "smackMexico",
        priority: 3,
      },
      slappedSmallest: {
        spriteSheet: "images/trump-slapped-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },
      victorySmallest: {
        spriteSheet: "images/trump-happy-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },






        // Tiniest size variants
        idleTiniest: {
          spriteSheet: "images/trump-idle-sprite-smallest.png",
          frameCount: 2,
          loopCount: Infinity,
          handVisible: false,
          priority: 3,
        },
        grabEastCanadaTiniest: {
          spriteSheet: "images/trump-grab-east-canada-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: true,
          handCoordinates: [
            { x: 1608, y: 1439, width: 737, height: 737 },
            { x: 1469, y: 1344, width: 737, height: 737 },
          ],
          calibrationScale: 0.23,
          smackAnimation: "smackEastCanada",
          priority: 3,
        },
        grabWestCanadaTiniest: {
          spriteSheet: "images/trump-grab-west-canada-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: true,
          handCoordinates: [
            { x: 286, y: 1248, width: 737, height: 737 },
            { x: 282, y: 1140, width: 737, height: 737 },
          ],
          calibrationScale: 0.23,
          smackAnimation: "smackWestCanada",
          priority: 3,
        },
        grabGreenlandTiniest: {
          spriteSheet: "images/trump-grab-greenland-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: true,
          handCoordinates: [
            { x: 2163, y: 754, width: 737, height: 737 },
            { x: 2072, y: 789, width: 737, height: 737 },
          ],
          calibrationScale: 0.23,
          smackAnimation: "smackGreenland",
          priority: 3,
        },
        grabMexicoTiniest: {
          spriteSheet: "images/trump-grab-mexico-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: true,
          handCoordinates: [
            { x: 1118, y: 2319, width: 737, height: 737 },
            { x: 906, y: 2445, width: 737, height: 737 },
          ],
          calibrationScale: 0.23,
          smackAnimation: "smackMexico",
          priority: 3,
        },
        slappedTiniest: {
          spriteSheet: "images/trump-slapped-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: false,
          priority: 3,
        },
        victoryTiniest: {
          spriteSheet: "images/trump-happy-sprite-smallest.png",
          frameCount: 2,
          loopCount: 4,
          handVisible: false,
          priority: 3,
        },









      shrinkDefeat: {
        spriteSheet: "images/trump-happy-sprite-smallest.png",
        frameCount: 2,
        loopCount: 4,
        handVisible: false,
        priority: 3,
      },
    };

   // Image loading tracking
   this.loadedSprites = new Set();
   this.loadingSprites = new Map(); // Map to track loading promises
   this.pendingAnimations = new Set(); // Track animations waiting to be shown

   this.stateQueue = [];
   this.isTransitioning = false;

   // Set up mobile-specific image paths
   if (window.DeviceUtils && window.DeviceUtils.isMobileDevice) {
     this._setupMobileImagePaths();
   }

   // Pass animations data to hand hitbox manager
   if (this.handHitboxManager) {
     this.handHitboxManager.setAnimationsData(this.animations);
   }
 }

 _setupMobileImagePaths() {
   // Replace sprite sheet paths with mobile versions
   Object.keys(this.animations).forEach(animName => {
     const anim = this.animations[animName];
     if (anim && anim.spriteSheet) {
       const originalPath = anim.spriteSheet;
       const mobilePath = originalPath.replace(/images\//, "images/mobile/");
       anim.spriteSheet = mobilePath;
     }
   });
 }

 init() {
   // Start by loading the essential animations
   this._loadByPriority(1).then(() => {
     // Start with idle animation once it's loaded
     this.changeState("idle");
     
     // Start the state monitor for safety
     this._startStateMonitor();
     
     // Load important animations in background
     this._loadByPriority(2);
     
     // Preload all grab animations since they're critical
     this._preloadGrabAnimations();
   });
 }

 _preloadGrabAnimations() {
  const grabAnimations = Object.keys(this.animations).filter(name => 
    name.startsWith('grab') && !name.includes('Small') && !name.includes('Smaller') && !name.includes('Smallest')
  );
  
  console.log(`Preloading ${grabAnimations.length} grab animations for gameplay`);
  
  // Also preload all smack animations
  const smackAnimations = Object.keys(this.animations).filter(name => 
    name.startsWith('smack')
  );
  
  console.log(`Preloading ${smackAnimations.length} smack animations for gameplay`);
  
  // Load both grab and smack animations together
  return this._loadMultipleAnimations([...grabAnimations, ...smackAnimations]);
}


_startStateMonitor() {
  if (this._stateMonitorInterval) {
      clearInterval(this._stateMonitorInterval);
  }

  this._stateMonitorInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceUpdate = now - this._lastAnimationUpdate;

      if (this.currentState !== "idle" && timeSinceUpdate > this._stuckStateTimeout) {
          console.warn(`Animation appears stuck in state ${this.currentState} for ${timeSinceUpdate}ms`);
          
          if (!this.isTransitioning) {
              console.warn("Forcing reset to idle state");
              
              // More robust reset
              this.stop();
              this.currentState = "idle";
              this.currentFrame = 0;
              this.loopCount = 0;
              this.onAnimationEnd = null;
              
              // Ensure we have a valid idle animation
              if (this.animations["idle"]) {
                  this.trumpSprite.style.backgroundImage = `url('${this.animations["idle"].spriteSheet}')`;
              }
              
              // Update the frame and restart
              this.updateFrame(0);
              this.play();
          }
      }
  }, 2000);
}

 /**
  * Load animations by priority level
  * @param {number} priorityLevel - Priority level (1=essential, 2=important, 3=optional)
  * @returns {Promise} - Resolves when all animations at this priority level are loaded
  */
 _loadByPriority(priorityLevel) {
   const animsToLoad = [];

   // Find all animations with the specified priority
   Object.keys(this.animations).forEach((animName) => {
     const anim = this.animations[animName];
     if (anim && anim.priority === priorityLevel && !this.loadedSprites.has(anim.spriteSheet) && !this.loadingSprites.has(anim.spriteSheet)) {
       animsToLoad.push(animName);
     }
   });

   return this._loadMultipleAnimations(animsToLoad);
 }

 /**
  * Load multiple animations by name
  * @param {Array<string>} animNames - Array of animation names to load
  * @returns {Promise} - Resolves when all are loaded
  */
 _loadMultipleAnimations(animNames) {
   const spriteUrls = [];
   
   // Collect all the sprite URLs to load
   animNames.forEach(animName => {
     const anim = this.animations[animName];
     if (anim && anim.spriteSheet) {
       if (!this.loadedSprites.has(anim.spriteSheet) && !this.loadingSprites.has(anim.spriteSheet)) {
         spriteUrls.push(anim.spriteSheet);
       }
     }
   });
   
   // Load all sprites in parallel
   return this._loadSprites(spriteUrls);
 }

 /**
  * Load specific sprite sheets
  * @param {Array} spriteUrls - Array of sprite URLs to load
  * @returns {Promise} - Resolves when all sprites are loaded
  */
 _loadSprites(spriteUrls) {
   const loadingPromises = [];

   spriteUrls.forEach((src) => {
     // Skip if already loaded
     if (this.loadedSprites.has(src)) {
       return;
     }

     // Reuse existing promise if already loading
     if (this.loadingSprites.has(src)) {
       loadingPromises.push(this.loadingSprites.get(src));
       return;
     }

     // Create new loading promise
     const loadPromise = new Promise((resolveLoad) => {
       const img = new Image();

       img.onload = () => {
         this.loadedSprites.add(src);
         this.loadingSprites.delete(src);
         resolveLoad(true);
       };

       img.onerror = () => {
         console.warn(`Failed to load sprite: ${src}`);
         this.loadingSprites.delete(src);
         resolveLoad(false); // Resolve with false to indicate failure
       };

       img.src = src;
     });

     // Store and track the promise
     this.loadingSprites.set(src, loadPromise);
     loadingPromises.push(loadPromise);
   });

   return Promise.all(loadingPromises);
 }

 createOverlayElement() {
   // Check if overlay already exists
   if (document.getElementById("smack-overlay")) return;

   const trumpContainer = document.getElementById("trump-sprite-container");
   if (!trumpContainer) {
     console.error("Trump container not found, cannot create smack overlay");
     return;
   }

   // Create overlay element
   const overlay = document.createElement("div");
   overlay.id = "smack-overlay";
   overlay.style.position = "absolute";
   overlay.style.width = "100%";
   overlay.style.height = "100%";
   overlay.style.backgroundRepeat = "no-repeat";
   overlay.style.backgroundSize = "auto 100%";
   overlay.style.zIndex = "3"; // Above trump but below hand
   overlay.style.display = "none";

   trumpContainer.appendChild(overlay);
 }

 // Weakens each successive shake
 _triggerLandingShake(baseScale = 1, soundVolume = 0.5) {
   // CSS shake would hijack the spin transform
   if (window.gameEngine?.systems?.state?.gameEnding) return;

   const gameContainer = document.getElementById('game-container');
   if (!gameContainer) return;

   this._landingShakeCount = (this._landingShakeCount || 0) + 1;
   const scale = baseScale * Math.max(0.3, 1 - (this._landingShakeCount - 1) * 0.25);
   gameContainer.style.setProperty('--shake-scale', scale);

   gameContainer.classList.remove('landing-shake');
   void gameContainer.offsetWidth; // force reflow so the animation restarts
   gameContainer.classList.add('landing-shake');

   clearTimeout(this._landingShakeTimeout);
   this._landingShakeTimeout = setTimeout(() => {
     gameContainer.classList.remove('landing-shake');
   }, 400);

   if (window.audioManager) {
     window.audioManager.play('ui', 'impact', soundVolume);
   }
 }

 // Method to set a specific frame

 setGameSpeed(speedMultiplier) {
   // Update the game speed multiplier
   this.gameSpeed = speedMultiplier;
 }

 queueStateChange(stateName, onEndCallback = null) {
   this.stateQueue.push({ stateName, onEndCallback });
   this.processStateQueue();
 }

 processStateQueue() {
   // Skip if transitioning or queue empty
   if (this.isTransitioning || this.stateQueue.length === 0) return;

   // Get the next state change
   const { stateName, onEndCallback } = this.stateQueue.shift();

   // Mark as transitioning
   this.isTransitioning = true;

   // Ensure sprite stays visible during transition
   if (this.trumpSprite) {
     this.trumpSprite.style.display = "block";
     this.trumpSprite.style.visibility = "visible";
   }

   // Use requestAnimationFrame for smoother transition
   requestAnimationFrame(() => {
     // Update actual state
     this._updateStateDirectly(stateName, onEndCallback);

     // Mark transition as complete
     this.isTransitioning = false;

     // Process next queued state change if any
     this.processStateQueue();
   });
 }

 _updateStateDirectly(stateName, onEndCallback) {
   // Adjust state name for current size
   const currentSize = window.freedomManager?.getTrumpSize()?.size || "normal";
   let finalStateName = stateName;

   if (currentSize !== "normal") {
     const sizedStateName = `${stateName}${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)}`;
     if (this.animations[sizedStateName]) {
       finalStateName = sizedStateName;
     }
   }

   // Update state directly
   if (this.animations[finalStateName]) {
     this.currentState = finalStateName;
     this.currentFrame = 0;
     this.loopCount = 0;
     this._landingShakeCount = 0;
     this.onAnimationEnd = onEndCallback;

     // Update sprite image
     if (this.trumpSprite) {
       this.trumpSprite.style.backgroundImage = `url('${this.animations[finalStateName].spriteSheet}')`;
     }

     // Update initial frame
     this.updateFrame(0);

     // CRUCIAL: Restart the animation
     this.play();
   }
 }

 // Ensures animations are loaded before changing state
 async changeState(stateName, onEndCallback = null) {
   const currentSize = window.freedomManager?.getTrumpSize()?.size || "normal";

   // Adjust stateName for current size
   if (currentSize !== "normal") {
     const sizedStateName = `${stateName}${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)}`;
     if (this.animations[sizedStateName]) {
       stateName = sizedStateName;
     }
   }

   // Check if state exists
   if (!this.animations[stateName]) {
     console.warn(`Animation state not found: ${stateName}`);
     return;
   }
   
   const animation = this.animations[stateName];
   const spriteSheet = animation.spriteSheet;

   // Preload matching smack animation for grabs
   if (stateName.startsWith('grab') && animation.smackAnimation) {
    const smackAnim = this.animations[animation.smackAnimation];
    if (smackAnim && !this.loadedSprites.has(smackAnim.spriteSheet)) {
      console.log(`Eagerly preloading smack animation: ${animation.smackAnimation}`);
      // Use eager loading instead of lazy loading
      this._loadSprites([smackAnim.spriteSheet]);
    }
  }

   // Load animation first if not loaded
   if (!this.loadedSprites.has(spriteSheet)) {
     try {
       // Add to pending animations
       this.pendingAnimations.add(stateName);
       
       // Load the sprite
       await this._loadSprites([spriteSheet]);
       
       // Remove from pending
       this.pendingAnimations.delete(stateName);
     } catch (error) {
       console.error(`Failed to load animation ${stateName}:`, error);
       this.pendingAnimations.delete(stateName);
       // Continue anyway to avoid breaking gameplay
     }
   }

   // Now queue the state change
   this.queueStateChange(stateName, onEndCallback);
 }

 updateFrame(frameIndex) {
   if (!this.trumpSprite) return;

   const animation = this.animations[this.currentState];
   if (!animation) return;

   // Ensure valid frame index
   frameIndex = Math.min(frameIndex, animation.frameCount - 1);

   this._lastAnimationUpdate = Date.now();

   const percentPosition = (frameIndex / (animation.frameCount - 1 || 1)) * 100;

   // Set background position in percentage
   this.trumpSprite.style.backgroundPosition = `${percentPosition}% 0%`;

   if (frameIndex === 1 && this.currentState.includes('slapped')) {
     this._triggerLandingShake();
   } else if (frameIndex === 1 && this.currentState.includes('victory')) {
     this._triggerLandingShake(0.25, 0.15);
   }

   const shouldEnlargeMobile = window.DeviceUtils.isMobileDevice &&
   (this.currentState.includes('slapped') || this.currentState.includes('victory') || this.currentState.includes('idle'));
   const shouldEnlargeDesktop = !window.DeviceUtils.isMobileDevice &&
   (this.currentState.includes('slapped') || this.currentState.includes('victory'));

   this.trumpSprite.classList.toggle('enlarged-trump-sprite-mobile', shouldEnlargeMobile);
   this.trumpSprite.classList.toggle('enlarged-trump-sprite', shouldEnlargeDesktop);

   // Update hand position if needed
   if (animation.handVisible) {
     this.handHitboxManager.updateStateAndFrame(this.currentState, frameIndex);
   }

   if (this.handHitboxManager) {
     const hitboxInfo = this.handHitboxManager.getHitboxInfo();
   }
 }

 play() {
  // Validate game speed
  if (!this.gameSpeed || this.gameSpeed <= 0) {
    console.warn('Invalid game speed, resetting to 5.3');
    this.gameSpeed = 5.3;
}

   // Clear any existing animation interval
   if (this.animationInterval) {
       clearInterval(this.animationInterval);
       this.animationInterval = null;
   }

   // Clear any existing animation frame
   if (this.animationFrame) {
       cancelAnimationFrame(this.animationFrame);
       this.animationFrame = null;
   }

   const animation = this.animations[this.currentState];
   if (!animation) {
       console.error(`No animation data found for state: ${this.currentState}`);
       return;
   }

   // If paused, don't start animation
   if (this.isPaused) return;

   // Calculate frame duration based on game speed
   let frameDuration;
   if (animation.frameDuration) {
       frameDuration = Math.max(50, animation.frameDuration / this.gameSpeed);
   } else {
       frameDuration = Math.max(50, this.baseFrameDuration / this.gameSpeed);
   }

   // For mobile, apply minimum frame duration
   if (window.DeviceUtils && window.DeviceUtils.isMobileDevice) {
       frameDuration = Math.max(frameDuration, 80);
   }

   // Track time for frame-based animation
   let lastFrameTime = performance.now();
   let accumulatedTime = 0;
   let animationStartTime = Date.now();

   // Animation loop using requestAnimationFrame
   const animateFrame = (timestamp) => {
       if (this.isPaused) return;

       // Calculate elapsed time
       const elapsed = timestamp - lastFrameTime;
       lastFrameTime = timestamp;

       // Accumulate time
       accumulatedTime += elapsed;

       if (accumulatedTime >= frameDuration) {
           accumulatedTime = 0;

           // Advance frame
           this.currentFrame++;

           // Check for loop completion
           if (this.currentFrame >= animation.frameCount) {
               // Reset frame counter
               this.currentFrame = 0;

               // Increase loop count
               this.loopCount++;

               // Check if max loops reached
               if (animation.loopCount && this.loopCount >= animation.loopCount) {
                   console.log(`Animation ${this.currentState} completed after ${Date.now() - animationStartTime}ms`);
                   
                   // Store callback before stopping
                   const callback = this.onAnimationEnd;
                   
                   // Stop animation first
                   this.stop();

                   // Execute callback with error handling
                   if (typeof callback === "function") {
                       try {
                           console.log(`Executing completion callback for ${this.currentState}`);
                           callback();
                       } catch (error) {
                           console.error(`Animation callback failed for ${this.currentState}:`, error);
                           
                           // Log the recovery attempt
                           console.warn("Attempting recovery from failed animation callback");
                           
                           // Force to idle state
                           this.changeState("idle");
                           
                           // Trigger new grab as fallback
                           if (window.gameEngine) {
                               console.log("Forcing new grab sequence after callback failure");
                               window.gameEngine.initiateGrab();
                           }
                       }
                   } else {
                       console.log(`No callback for ${this.currentState}, returning to idle`);
                       this.changeState("idle");
                   }
                   return;
               }
           }

           // Update the displayed frame
           this.updateFrame(this.currentFrame);
       }

       // Continue the animation loop
       this.animationFrame = requestAnimationFrame(animateFrame);
   };


   // Start the animation loop
   if (!this.isPaused) {
       this.animationFrame = requestAnimationFrame(animateFrame);
   }
 }

 stop() {
   // Clear timers but DON'T change sprite visibility
   if (this.animationInterval) {
     clearInterval(this.animationInterval);
     this.animationInterval = null;
   }

   if (this.animationFrame) {
     cancelAnimationFrame(this.animationFrame);
     this.animationFrame = null;
   }

   // Make sure sprite stays visible
   if (this.trumpSprite) {
     this.trumpSprite.style.display = "block";
     this.trumpSprite.style.visibility = "visible";
   }
 }

 createFlagAnimation(countryId, position, scale = 1.0) {
   const flagElement = document.createElement("div");
   flagElement.id = `${countryId}-trump-flag`;
   flagElement.className = "trump-flag-animation";
   
   // Style the flag
   Object.assign(flagElement.style, {
     position: "absolute",
     left: `${position.x}px`,
     top: `${position.y}px`,
     width: `${400 * scale}px`,
     height: `${400 * scale}px`,
     backgroundImage: "url('images/trump-flag.png')",
     backgroundSize: "400% 100%", // 4 frames side by side
     backgroundPosition: "0% 0%",
     backgroundRepeat: "no-repeat",
     zIndex: "1", // Above country overlay
     transform: `rotate(${-5 + Math.random() * 90}deg)`, // Slight random rotation
     transformOrigin: "bottom center",
     filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
   });
   
   // Get the game container
   const gameContainer = document.getElementById("game-container");
   if (gameContainer) {
     gameContainer.appendChild(flagElement);
   }
   
   // Create and return the animation
   const animationId = this.createSpriteAnimation({
     element: flagElement,
     frameCount: 4,
     frameDuration: 500 + Math.random() * 300, // Random variation in timing
     loop: true,
     id: `flag-${countryId}-${Date.now()}`,
   });
   
   return {
     element: flagElement,
     animationId: animationId
   };
 }

 removeAllFlags() {
   document.querySelectorAll('.trump-flag-animation').forEach(flag => {
     const animId = flag.getAttribute('data-animation-id');
     if (animId) {
       this.stopSpriteAnimation(animId);
     }
     if (flag.parentNode) {
       flag.parentNode.removeChild(flag);
     }
   });
 }

 destroy() {
   this.stop();
   if (this.handHitboxManager && typeof this.handHitboxManager.destroy === "function") {
     this.handHitboxManager.destroy();
   }

   if (this._stateMonitorInterval) {
     clearInterval(this._stateMonitorInterval);
     this._stateMonitorInterval = null;
   }

   // Clear all references
   this.trumpSprite = null;
   this.animations = null;
   this.currentState = "";
   this.onAnimationEnd = null;

   this.removeAllFlags();

   // Remove overlay
   const overlay = document.getElementById("smack-overlay");
   if (overlay && overlay.parentNode) {
     overlay.parentNode.removeChild(overlay);
   }

   if (this.spriteAnimations) {
     Object.keys(this.spriteAnimations).forEach((id) => {
       clearInterval(this.spriteAnimations[id].interval);
     });
     this.spriteAnimations = {};
   }
 }

 // Loads new size variant on size change

 _applySizeChange(newSize, newStateName) {
   // Store current size before changing
   this.currentSizeVariant = newSize;

   // Update sprite sheet and record state change
   if (this.trumpSprite) {
     this.trumpSprite.style.backgroundImage = `url('${this.animations[newStateName].spriteSheet}')`;

     // Apply backup state name if needed
     if (this.handHitboxManager) {
        if (typeof this.handHitboxManager.handleSizeChange === "function") {
         this.handHitboxManager.handleSizeChange(newSize);
       }
     }
   }
 }

 // Preload the next size variant before transition

 pause() {
   this.isPaused = true;

   // Store current animation state for restoration
   this._pausedState = {
     state: this.currentState,
     frame: this.currentFrame,
     loopCount: this.loopCount,
     callback: this.onAnimationEnd,
   };

   // Stop animation loops but don't reset state
   if (this.animationInterval) {
     clearInterval(this.animationInterval);
     this.animationInterval = null;
   }

   if (this.animationFrame) {
     cancelAnimationFrame(this.animationFrame);
     this.animationFrame = null;
   }
 }

 resume() {
   if (!this.isPaused) {
     return;
   }

   this.isPaused = false;

   // If we have saved state, restore it
   if (this._pausedState) {
     // If it's a smack animation, special handling
     if (this._pausedState.state && this._pausedState.state.startsWith("smack")) {
       // Smack animations restart from beginning
       this.changeState(this._pausedState.state, this._pausedState.callback);
     } else {
       // Regular animations resume at saved frame
       this.currentState = this._pausedState.state;
       this.currentFrame = this._pausedState.frame;
       this.loopCount = this._pausedState.loopCount;
       this.onAnimationEnd = this._pausedState.callback;

        this.updateFrame(this.currentFrame);

       // Restart the animation
       this.play();
     }

     // Clear the saved state
     this._pausedState = null;
   } else {
      this.play();
   }
 }

 playSmackAnimation(animationNameOrCountry, onCompleteCallback) {
  // Get the smack overlay element
  const overlay = document.getElementById("smack-overlay");
  if (!overlay) {
    console.error("Smack overlay element not found");
    if (typeof onCompleteCallback === "function") {
      onCompleteCallback();
    }
    return;
  }

  // Determine the correct smack animation name
  let smackAnimationName = this._determineSmackAnimationName(animationNameOrCountry);

  // Check if animation exists
  if (!this.animations[smackAnimationName]) {
    console.error(`Smack animation "${smackAnimationName}" not found in available animations!`);
    if (typeof onCompleteCallback === "function") {
      onCompleteCallback();
    }
    return;
  }

  // Get animation data
  const smackAnimation = this.animations[smackAnimationName];
  
  if (!this.loadedSprites.has(smackAnimation.spriteSheet)) {
    // Create image and load it synchronously
    const img = new Image();
    img.src = smackAnimation.spriteSheet;
    // Track it as loaded regardless
    this.loadedSprites.add(smackAnimation.spriteSheet);
    console.log(`Force loading smack animation: ${smackAnimationName}`);
  }

  // Set up frame data
  const frameCount = smackAnimation.frameCount || 5;
  let currentFrame = 0;
  let impactTriggered = false;
  const impactFrame = Math.min(3, frameCount - 1);
  
  // Set up overlay immediately
  overlay.style.backgroundImage = `url('${smackAnimation.spriteSheet}')`;
  overlay.style.display = "block";
  overlay.style.backgroundPosition = "0% 0%";
  
  // Use standard setInterval instead of requestAnimationFrame
  const animInterval = setInterval(() => {
    // Update frame
    currentFrame++;
    
    // Calculate position
    const percentPosition = ((currentFrame / (frameCount - 1)) * 100);
    overlay.style.backgroundPosition = `${percentPosition}% 0%`;
    
    // Trigger callback at impact frame
    if (!impactTriggered && currentFrame >= impactFrame) {
      impactTriggered = true;
      if (typeof onCompleteCallback === "function") {
        onCompleteCallback();
      }
    }
    
    // End animation when complete
    if (currentFrame >= frameCount - 1) {
      clearInterval(animInterval);
      overlay.style.display = "none";
    }
  }, 120); // Fixed frame duration
}

  // Helper method to determine smack animation name
  _determineSmackAnimationName(animationNameOrCountry) {
    if (typeof animationNameOrCountry === "string") {
      if (animationNameOrCountry.startsWith("smack")) {
        return animationNameOrCountry;
      }

      const countryToAnimation = {
        eastcanada: "smackEastCanada",
        westcanada: "smackWestCanada",
        greenland: "smackGreenland",
        mexico: "smackMexico",
        canada: "smackEastCanada", // Default for generic "canada"
      };

      const lowerCountry = animationNameOrCountry.toLowerCase();
      return countryToAnimation[lowerCountry] || `smack${animationNameOrCountry.charAt(0).toUpperCase() + animationNameOrCountry.slice(1)}`;
    }

    return "smackMexico"; // Fallback
  }

  // Enable or disable debug mode
  setDebugMode(enabled) {
    this.debug = enabled;
    if (this.handHitboxManager && typeof this.handHitboxManager.setDebugMode === "function") {
      this.handHitboxManager.setDebugMode(enabled);
    }
  }

  // Get current animation data
  getCurrentAnimation() {
    return {
      name: this.currentState,
      frame: this.currentFrame,
      data: this.animations[this.currentState],
      hitbox: this.handHitboxManager ? this.handHitboxManager.getHitboxInfo() : null,
    };
  }

  // Get current hitbox information
  getHitboxInfo() {
    return this.handHitboxManager ? this.handHitboxManager.getHitboxInfo() : null;
  }

  reset() {
    if (this.trumpSprite) {
      this.trumpSprite.style.display = "block"; // Make sure Trump is visible again
    }
    this.changeState("idle"); // Return to normal idle state
  }

  // Preload essentials for a size variant

  // Preload grab animations for a country

  createSpriteAnimation(options) {
    const {
      element, // DOM element to animate
      frameCount, // Number of frames in the sprite
      frameDuration, // Duration per frame
      loop = true, // Whether to loop the animation
      onComplete, // Callback when animation completes
      id, // Unique identifier for this animation
      customUpdater, // Custom update function (optional)
    } = options;

    if (!element && !customUpdater) {
      console.error("Cannot create sprite animation: No element provided");
      return null;
    }

    const animationId = id || `sprite-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Clear any existing animation with this ID
    if (this.spriteAnimations && this.spriteAnimations[animationId]) {
      clearInterval(this.spriteAnimations[animationId].interval);
    }

    // Initialize sprite animations tracking if needed
    if (!this.spriteAnimations) {
      this.spriteAnimations = {};
    }

    let currentFrame = 0;
    const maxLoops = loop ? Infinity : 1;
    let loopCount = 0;

    // Create the animation interval
    const interval = setInterval(() => {
      // Skip if paused
      if (this.isPaused) return;

      // Use custom updater if provided
      if (customUpdater) {
        customUpdater();
        return;
      }

      // Standard sprite sheet animation
      currentFrame = (currentFrame + 1) % frameCount;
      const percentPosition = (currentFrame / (frameCount - 1)) * 100;
      element.style.backgroundPosition = `${percentPosition}% 0%`;

      // Handle loop counting
      if (currentFrame === 0 && !loop) {
        loopCount++;
        if (loopCount >= maxLoops) {
          this.stopSpriteAnimation(animationId);
          if (typeof onComplete === "function") {
            onComplete();
          }
        }
      }
    }, frameDuration);

    // Store the animation data
    this.spriteAnimations[animationId] = {
      interval,
      element,
      currentFrame,
      frameCount,
      loopCount,
      maxLoops,
      onComplete,
    };

    // Save animation ID on element for cleanup
    if (element) {
      element.setAttribute('data-animation-id', animationId);
    }

    return animationId;
  }

  stopSpriteAnimation(animationId) {
    if (!this.spriteAnimations || !this.spriteAnimations[animationId]) {
      return false;
    }

    clearInterval(this.spriteAnimations[animationId].interval);
    delete this.spriteAnimations[animationId];
    return true;
  }

}

window.AnimationManager = AnimationManager;