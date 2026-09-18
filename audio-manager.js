// Voice clip durations, generated via afinfo
const PROTEST_CLIP_DURATIONS_MS = {
  "protestEastCan1.mp3": 1080,
  "protestEastCan2.mp3": 1056,
  "protestEastCan3.mp3": 1176,
  "protestEastCan4.mp3": 1776,
  "protestEastCan5.mp3": 1032,
  "protestEastCan6.mp3": 1032,
  "protestEastCan7.mp3": 1176,
  "protestEastCan8.mp3": 1032,
  "protestEastCan9.mp3": 2376,
  "protestEastCan10.mp3": 1728,
  "protestEastCan11.mp3": 1104,
  "protestEastCan12.mp3": 1440,
  "protestEastCan13.mp3": 432,
  "protestEastCan14.mp3": 2616,
  "protestEastCan15.mp3": 1152,
  "protestEastCan16.mp3": 792,
  "protestEastCan17.mp3": 1128,
  "protestEastCan18.mp3": 1200,
  "protestEastCan19.mp3": 1272,
  "protestEastCan20.mp3": 624,
  "protestEastCan21.mp3": 888,
  "protestEastCan22.mp3": 1488,
  "protestEastCan23.mp3": 792,
  "protestEastCan24.mp3": 744,
  "protestEastCan25.mp3": 672,
  "protestEastCan26.mp3": 1032,
  "protestEastCan27.mp3": 648,
  "protestEastCan28.mp3": 624,
  "protestEastCan29.mp3": 1152,
  "protestEastCan30.mp3": 936,
  "protestEastCan31.mp3": 1176,
  "protestEastCan32.mp3": 1032,
  "protestEastCan33.mp3": 1896,
  "protestEastCan34.mp3": 768,
  "protestEastCan35.mp3": 984,
  "protestEastCan36.mp3": 984,
  "protestEastCan37.mp3": 1296,
  "protestEastCan38.mp3": 696,
  "protestEastCan39.mp3": 624,
  "protestEastCan40.mp3": 2136,

  "protestWestCan1.mp3": 1032,
  "protestWestCan2.mp3": 1056,
  "protestWestCan3.mp3": 1488,
  "protestWestCan4.mp3": 864,
  "protestWestCan5.mp3": 1920,
  "protestWestCan6.mp3": 2280,
  "protestWestCan7.mp3": 2208,
  "protestWestCan8.mp3": 2376,
  "protestWestCan9.mp3": 960,
  "protestWestCan10.mp3": 1056,
  "protestWestCan11.mp3": 2640,
  "protestWestCan12.mp3": 2664,
  "protestWestCan13.mp3": 1824,
  "protestWestCan14.mp3": 552,
  "protestWestCan15.mp3": 1224,
  "protestWestCan16.mp3": 1104,
  "protestWestCan17.mp3": 1944,
  "protestWestCan18.mp3": 2904,
  "protestWestCan19.mp3": 2064,
  "protestWestCan20.mp3": 1320,
  "protestWestCan21.mp3": 1344,
  "protestWestCan22.mp3": 1512,
  "protestWestCan23.mp3": 3504,
  "protestWestCan24.mp3": 1944,
  "protestWestCan25.mp3": 696,
  "protestWestCan26.mp3": 1296,
  "protestWestCan27.mp3": 480,
  "protestWestCan28.mp3": 960,
  "protestWestCan29.mp3": 1800,
  "protestWestCan30.mp3": 1128,
  "protestWestCan31.mp3": 1296,
  "protestWestCan32.mp3": 1128,
  "protestWestCan33.mp3": 984,
  "protestWestCan34.mp3": 1008,

  "protestMex1.mp3": 960,
  "protestMex2.mp3": 1464,
  "protestMex3.mp3": 1632,
  "protestMex4.mp3": 1584,
  "protestMex5.mp3": 1584,
  "protestMex6.mp3": 1512,
  "protestMex7.mp3": 1056,
  "protestMex8.mp3": 1128,
  "protestMex9.mp3": 2328,
  "protestMex10.mp3": 2088,
  "protestMex11.mp3": 768,
  "protestMex12.mp3": 1992,
  "protestMex13.mp3": 1176,
  "protestMex14.mp3": 2400,
  "protestMex15.mp3": 1464,
  "protestMex16.mp3": 648,
  "protestMex17.mp3": 1848,
  "protestMex18.mp3": 768,
  "protestMex19.mp3": 1920,
  "protestMex20.mp3": 816,
  "protestMex21.mp3": 480,
  "protestMex22.mp3": 696,
  "protestMex23.mp3": 2112,

  "protestGreen1.mp3": 1920,
  "protestGreen2.mp3": 1872,
  "protestGreen3.mp3": 1728,
  "protestGreen4.mp3": 3432,
  "protestGreen5.mp3": 1056,
  "protestGreen6.mp3": 1104,
  "protestGreen7.mp3": 1056,
  "protestGreen8.mp3": 768,
  "protestGreen9.mp3": 744,
  "protestGreen10.mp3": 984,
  "protestGreen11.mp3": 1560,
  "protestGreen12.mp3": 840,
  "protestGreen13.mp3": 792,
  "protestGreen14.mp3": 576,
  "protestGreen15.mp3": 720,
  "protestGreen16.mp3": 600,
  "protestGreen17.mp3": 864,
  "protestGreen18.mp3": 1056,
  "protestGreen19.mp3": 384,
};
const DEFAULT_PROTEST_CLIP_DURATION_MS = 1400;
// Trims encoder padding off measured lengths
const PROTEST_CLIP_DURATION_SCALE = 0.85;

class AudioManager {
  /**
   * Create a new AudioManager instance
   */
  constructor() {
    // Device detection - do this once
    this.isMobile = this._isMobileDevice();
    this.isIOS = this._isIOSDevice();
    this.lowMemoryDevice = this._isLowMemoryDevice();
    // Enhanced network detection
    this.networkInfo = {
      isSlowConnection: this._detectSlowConnection(),
      isCellular: this._detectCellular(),
      isDataSaver: this._detectDataSaver(),
      connectionQuality: this._assessConnectionQuality(),
    };

    // Debug and initialization tracking
    this.debugInfo = {
      audioContextCreated: false,
      criticalSoundsLoaded: false,
      playAttempts: 0,
      firstPlayTimestamp: 0,
      resumeAttempts: 0,
    };

    // Audio state
    this.audioContextRunning = false;
    this.initialized = false;
    this.muted = false;
    this.volume = 1.0;
    this.gameSpeed = 1.0;

    // Base delay configuration
    this.baseDelays = {
      catchphrase: 2,
      grabWarning: 0.5,
      protest: 0.5,
      sobToProtest: 0.8,
    };

    // Adjust configs based on device capabilities
    if (this.networkInfo.isSlowConnection) {
      console.log("[AUDIO] Slow connection detected, optimizing audio loading");
      this._adjustForSlowConnection();
    }

    // Network-adaptive progressive loading configuration
    this.progressiveLoading = {
      peopleSayNo: {
        eastCanadaSaysNo: { loaded: 0, loading: 0, failed: 0 },
        westCanadaSaysNo: { loaded: 0, loading: 0, failed: 0 },
        mexicoSaysNo: { loaded: 0, loading: 0, failed: 0 },
        greenlandSaysNo: { loaded: 0, loading: 0, failed: 0 },
      },

      // Network-adaptive configuration
      config: this._getNetworkAdaptiveConfig(),

      // Loading state
      lastLoadTime: 0,
      loadingQueue: [],
      maxConcurrentLoads: this.networkInfo.isSlowConnection ? 1 : 2,
    };

    // Listen for network changes
    this._setupNetworkListeners();

    // Adjust paths for mobile
    if (this.isMobile) {
      this._adjustPathsForMobile();
    }

    // Slap sounds get top priority
    this.soundPriorities = {
      immediate: ["slap1", "slap2", "slap3", "slap4", "smash"], // Highest priority for immediate response
      critical: ["click", "gameStart", "trumpGrabbing1", "grabWarning"],
      important: ["partialAnnex1", "fullAnnex1", "stopHim", "smackThatHand", "been-very-nice-to-you"],
      // ["trump", "trumpGrabbing", 0],],
      background: [], // Will be filled with remaining sounds
    };

    // Sound structure - organized by purpose
    this.sounds = {
      ui: {},
      trump: {
        trumpGrabbing: [],
        partialAnnexCry: [],
        fullAnnexCry: [],
        trumpVictorySounds: [],
        trumpSob: [],
      },
      defense: {
        slap: [],
        peopleSayNo: {
          eastCanadaSaysNo: [],
          westCanadaSaysNo: [],
          mexicoSaysNo: [],
          greenlandSaysNo: [],
        },
      },
      protestors: {},
      resistance: {
        canada: [],
        mexico: [],
        greenland: [],
      },
      particles: {
        freedom: [],
      },
      music: {},
    };

    // Avoids lookup overhead for critical sounds
    this._criticalSoundsCache = {};

    // Audio files catalog
    this.soundFiles = {
      ui: {
        click: "click.mp3",
        worldClick: "worldClick.mp3",
        gameStart: "gameStart.mp3",
        gameOver: "gameOver.mp3",
        win: "resistanceWins.mp3",
        lose: "resistanceLoses.mp3",
        grabWarning: "grabWarning.mp3",
        resistance: "resistance.mp3",
        instruction: "instruction.mp3",
        aliens: "aliens.mp3",
        musk: "musk.mp3",
        growProtestors: "growProtestors.mp3",
        stopHim: "stop-him.mp3",
        smackThatHand: "smack-that-hand.mp3",
        faster: "faster.mp3",
        oopsieTradeWar: "oopsie-trade-war.mp3",
        noOneIsComingToSaveUs: "no-one-is-coming-to-save-us.mp3",
        getUpAndFight: "get-up-and-fight.mp3",
        readySetGo: "ready-set-go.mp3",
        help: "help.mp3",
        wrong: "wrong.mp3",
        uhhuh: "uhhuh.mp3",
        impact: "effect.mp3",
      },
      trump: {
        trumpGrabbing1: ["trumpGrabbing1.mp3"],
        partialAnnexCry: ["partialAnnex1.mp3", "partialAnnex2.mp3", "partialAnnex3.mp3"],
        fullAnnexCry: ["fullAnnex1.mp3", "fullAnnex2.mp3", "fullAnnex3.mp3", "fullAnnex4.mp3", "fullAnnex5.mp3"],
        trumpVictorySounds: ["victory1.mp3", "victory2.mp3", "victory3.mp3"],
        trumpSob: ["trumpSob1.mp3", "trumpSob2.mp3"],
        trumpYa: ["ya.mp3", "great.mp3", "mmhmn.mp3"],
        beenVeryNiceToYou: "been-very-nice-to-you.mp3",
        fourYears: "four-years.mp3",
        shrink: ["no.mp3"],
        finalShrink: "ouchie.mp3",
        trumpSmash: ["smash.mp3", "smash1.mp3", "smash.mp3"],
      },
      resistance: {
        canada: ["canadaResist1.mp3", "canadaResist2.mp3", "canadaResist3.mp3"],
        mexico: ["mexicoResist1.mp3", "mexicoResist2.mp3", "mexicoResist3.mp3"],
        greenland: ["greenlandResist1.mp3", "greenlandResist2.mp3", "greenlandResist3.mp3"],
        usa: ["greenlandResist1.mp3", "greenlandResist2.mp3"],
      },
      defense: {
        slap: ["slap1.mp3", "slap2.mp3", "slap3.mp3", "slap4.mp3"],
        peopleSayNo: {
          eastCanadaSaysNo: [
            "protestEastCan1.mp3",
            "protestEastCan2.mp3",
            "protestEastCan3.mp3",
            "protestEastCan4.mp3",
            "protestEastCan5.mp3",
            "protestEastCan6.mp3",
            "protestEastCan7.mp3",
            "protestEastCan8.mp3",
            "protestEastCan9.mp3",
            "protestEastCan10.mp3",
            "protestEastCan11.mp3",
            "protestEastCan12.mp3",
            "protestEastCan13.mp3",
            "protestEastCan14.mp3",
            "protestEastCan15.mp3",
            "protestEastCan16.mp3",
            "protestEastCan17.mp3",
            "protestEastCan18.mp3",
            "protestEastCan19.mp3",
            "protestEastCan20.mp3",
            "protestEastCan21.mp3",
            "protestEastCan22.mp3",
            "protestEastCan23.mp3",
            "protestEastCan24.mp3",
            "protestEastCan25.mp3",
            "protestEastCan26.mp3",
            "protestEastCan27.mp3",
            "protestEastCan28.mp3",
            "protestEastCan29.mp3",
            "protestEastCan30.mp3",
            "protestEastCan31.mp3",
            "protestEastCan32.mp3",
            "protestEastCan33.mp3",
            "protestEastCan34.mp3",
            "protestEastCan35.mp3",
            "protestEastCan36.mp3",
            "protestEastCan37.mp3",
            "protestEastCan38.mp3",
            "protestEastCan39.mp3",
            "protestEastCan40.mp3",
            "protestEastCan41.mp3",
          ],
          westCanadaSaysNo: [
            "protestWestCan1.mp3",
            "protestWestCan2.mp3",
            "protestWestCan3.mp3",
            "protestWestCan4.mp3",
            "protestWestCan5.mp3",
            "protestWestCan6.mp3",
            "protestWestCan7.mp3",
            "protestWestCan8.mp3",
            "protestWestCan9.mp3",
            "protestWestCan10.mp3",
            "protestWestCan11.mp3",
            "protestWestCan12.mp3",
            "protestWestCan13.mp3",
            "protestWestCan14.mp3",
            "protestWestCan15.mp3",
            "protestWestCan16.mp3",
            "protestWestCan17.mp3",
            "protestWestCan18.mp3",
            "protestWestCan19.mp3",
            "protestWestCan20.mp3",
            "protestWestCan21.mp3",
            "protestWestCan22.mp3",
            "protestWestCan23.mp3",
            "protestWestCan24.mp3",
            "protestWestCan25.mp3",
            "protestWestCan26.mp3",
            "protestWestCan27.mp3",
            "protestWestCan28.mp3",
            "protestWestCan29.mp3",
            "protestWestCan30.mp3",
            "protestWestCan31.mp3",
            "protestWestCan32.mp3",
            "protestWestCan33.mp3",
            "protestWestCan34.mp3",
          ],
          mexicoSaysNo: [
            "protestMex1.mp3",
            "protestMex2.mp3",
            "protestMex3.mp3",
            "protestMex4.mp3",
            "protestMex5.mp3",
            "protestMex6.mp3",
            "protestMex7.mp3",
            "protestMex8.mp3",
            "protestMex9.mp3",
            "protestMex10.mp3",
            "protestMex11.mp3",
            "protestMex12.mp3",
            "protestMex13.mp3",
            "protestMex14.mp3",
            "protestMex15.mp3",
            "protestMex16.mp3",
            "protestMex17.mp3",
            "protestMex18.mp3",
            "protestMex19.mp3",
            "protestMex20.mp3",
            "protestMex21.mp3",
            "protestMex22.mp3",
          ],
          greenlandSaysNo: [
            "protestGreen1.mp3",
            "protestGreen2.mp3",
            "protestGreen3.mp3",
            "protestGreen4.mp3",
            "protestGreen5.mp3",
            "protestGreen6.mp3",
            "protestGreen7.mp3",
            "protestGreen8.mp3",
            "protestGreen9.mp3",
            "protestGreen10.mp3",
            "protestGreen11.mp3",
            "protestGreen12.mp3",
            "protestGreen13.mp3",
            "protestGreen14.mp3",
            "protestGreen15.mp3",
            "protestGreen16.mp3",
            "protestGreen17.mp3",
            "protestGreen18.mp3",
            "protestGreen19.mp3",
          ],
        },
      },
      protestors: {
        eastCanadaProtestors: "protestorsEastCan2.mp3",
        westCanadaProtestors: "protestorsEastCan2.mp3",
        mexicoProtestors: "protestorsEastCan2.mp3",
        greenlandProtestors: "protestorsEastCan2.mp3",
        usaProtestors: "protestorsEastCan2.mp3",
      },
      particles: {
        freedom: ["freedomSpark1.mp3", "freedomSpark2.mp3", "freedomSpark3.mp3"],
      },
      music: {
        background: "background-music.mp3",
      },
    };

    this.trumpShoutsAtACountry = {
      canada: ["trumpShoutsAtCanada1.mp3", "trumpShoutsAtCanada2.mp3", "trumpShoutsAtCanada3.mp3", "trumpShoutsAtCanada4.mp3"],
      mexico: ["trumpShoutsAtMexico1.mp3", "trumpShoutsAtMexico2.mp3", "trumpShoutsAtMexico3.mp3"],
      greenland: ["trumpShoutsAtGreenland1.mp3", "trumpShoutsAtGreenland2.mp3", "trumpShoutsAtGreenland3.mp3", "trumpShoutsAtGreenland4.mp3"],
      generic: ["trumpShoutsAtAnyone1.mp3", "trumpShoutsAtAnyone2.mp3", "trumpShoutsAtAnyone3.mp3"],
    };

    // Unified tracking system
    this.shuffleTracking = {
      indices: {},
      arrays: {},
    };

    // Centralized sound tracking
    this.loadedSounds = new Set(); // Track loaded sounds
    this.loadingPromises = {}; // Track loading promises to avoid duplicate loading
    this.currentlyPlaying = []; // Track currently playing sounds

    this._instantSlapSounds = [];
    // Pre-decoded slap buffers for fast path
    this._slapBuffers = [];

    // Playback state
    this.backgroundMusic = null;
    this.backgroundMusicPlaying = false;
    this.activeProtestorSounds = {};

    // Grab sound state
    this.activeGrabSound = null;
    this.grabVolumeInterval = null;
    this.currentGrabVolume = 0.2;
    this.maxGrabVolume = 1.0;
    this.grabVolumeStep = 0.05;

    // iOS ignores .volume; use gain nodes
    this._gainNodes = new WeakMap();

    this.soundPath = "sounds/";

    // Set up fade interval tracking
    this._fadeIntervals = {};

    // Set up audio context
    this._setupAudioContext();

    // Create primed audio pool
    if (!window._primedAudioPool) {
      window._primedAudioPool = [];
      this._prepareAudioPool(8); // Increased pool size for better immediate playback
    }

    // Prepare asset loader
    this._prepareAssetLoader();
  }

  /**
 * Get configuration based on network conditions
 */
_getNetworkAdaptiveConfig() {
  if (this.networkInfo.isDataSaver) {
    return {
      initialLoadCount: 1,
      progressiveLoadCount: 1,
      maxLoadCount: 4,
      loadTriggerThreshold: 1,
      loadDelay: 2000, // Wait 2 seconds between loads
      retryDelay: 5000,
      maxRetries: 2,
    };
  }
  
  if (this.networkInfo.isSlowConnection || this.networkInfo.isCellular) {
    return {
      initialLoadCount: 2,
      progressiveLoadCount: 2,
      maxLoadCount: 8,
      loadTriggerThreshold: 1,
      loadDelay: 1000, // Wait 1 second between loads
      retryDelay: 3000,
      maxRetries: 3,
    };
  }
  
  // Fast connection (WiFi, etc.)
  return {
    initialLoadCount: 4,
    progressiveLoadCount: 3,
    maxLoadCount: 999,
    loadTriggerThreshold: 2,
    loadDelay: 200,
    retryDelay: 1000,
    maxRetries: 5,
  };
}

/**
 * Enhanced cellular detection
 */
_detectCellular() {
  if (navigator.connection) {
    const conn = navigator.connection;
    return conn.type === "cellular" || 
           conn.effectiveType === "slow-2g" ||
           conn.effectiveType === "2g" ||
           conn.effectiveType === "3g" ||
           conn.effectiveType === "4g";
  }
  return false;
}

/**
 * Detect data saver mode
 */
_detectDataSaver() {
  if (navigator.connection && navigator.connection.saveData) {
    return true;
  }
  
  // Additional heuristics for data saver detection
if (this._detectSlowConnection() && this.lowMemoryDevice) {
  return true;
}
  
  return false;
}

/**
 * Assess overall connection quality
 */
_assessConnectionQuality() {
  if (!navigator.connection) return 'unknown';
  
  const conn = navigator.connection;
  
  if (conn.effectiveType === '4g' && !conn.saveData) return 'excellent';
  if (conn.effectiveType === '4g' || conn.effectiveType === '3g') return 'good';
  if (conn.effectiveType === '2g') return 'poor';
  return 'slow';
}

/**
 * Setup network change listeners
 */
_setupNetworkListeners() {
  if (navigator.connection) {
    navigator.connection.addEventListener('change', () => {
      console.log('[AUDIO] Network conditions changed');
      
      // Reassess network conditions
      this.networkInfo = {
        isSlowConnection: this._detectSlowConnection(),
        isCellular: this._detectCellular(),
        isDataSaver: this._detectDataSaver(),
        connectionQuality: this._assessConnectionQuality(),
      };
      
      // Update configuration
      this.progressiveLoading.config = this._getNetworkAdaptiveConfig();
      
      console.log(`[AUDIO] Network quality: ${this.networkInfo.connectionQuality}, Cellular: ${this.networkInfo.isCellular}`);
    });
  }
}

  /**
   * Initialize the audio manager
   */
  init() {
    if (this.initialized) return;

    // Resume existing context, don't recreate
    this.resumeAudioContext();

    // Adjust mobile sound path if needed
    if (this.isMobile && !this.soundPath.startsWith(window.location.origin)) {
      this._adjustPathsForMobile();
    }

    this.initialized = true;

    // Start loading sounds with prioritization
    this._loadSoundsByPriority();
  }

  _setupAudioContext() {
    // Skip if context already exists
    if (this.audioContext) return;

    try {
      if (!window.sharedAudioContext) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.sharedAudioContext = new AudioContext();
      }
      this.audioContext = window.sharedAudioContext;

      this.debugInfo.audioContextCreated = true;
    } catch (e) {
      console.warn("[AUDIO] Web Audio API not supported:", e.message);
      this.audioContext = null;
    }
  }

  resumeAudioContext() {
    if (!this.audioContext) {
      return Promise.resolve(false);
    }

    // Avoid unnecessary work if already running
    if (this.audioContextRunning && this.audioContext.state === "running") {
      return Promise.resolve(true);
    }

    if (this.audioContext.state === "suspended") {
      this.debugInfo.resumeAttempts++;

      return this.audioContext
        .resume()
        .then(() => {
          this.audioContextRunning = true;

          if (this.loadedSounds.size === 0) {
            this.preloadCriticalSounds();
          }
          return true;
        })
        .catch((err) => {
          console.error("[AUDIO] Failed to resume AudioContext:", err);
          return false;
        });
    }

    this.audioContextRunning = true;
    return Promise.resolve(true);
  }

  playIfContextReady(category, name, volume = null) {
    // Only play if AudioContext is already running
    if (this.audioContext && this.audioContextRunning && this.audioContext.state === "running") {
      return this.play(category, name, volume);
    }

    // Otherwise, skip playing this sound
    return Promise.resolve(null);
  }

  /**
   * Unlock audio playback (especially for iOS)
   */
  unlock() {
    // First try to resume the AudioContext
    return this.resumeAudioContext().then((contextResult) => {
      // iOS: also try silent sound
      if (this.isIOS) {
        return this._unlockWithSilentSound().then((silentResult) => {
          return contextResult || silentResult;
        });
      }
      return contextResult;
    });
  }

  _unlockWithSilentSound() {
    return new Promise((resolve) => {
      try {
        // Use a data URI for guaranteed availability
        const silentSound = new Audio(
          "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAADAABgYGBgYGBgYGBgkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg//////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAYAAAAAAAAAAwDVxttG//sUxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
        );

        silentSound.volume = 0.01;
        const playPromise = silentSound.play();

        if (playPromise instanceof Promise) {
          playPromise
            .then(() => {
              setTimeout(() => {
                silentSound.pause();
                silentSound.src = "";
                resolve(true);
              }, 100);
            })
            .catch(() => {
              resolve(false);
            });
        } else {
          setTimeout(() => {
            silentSound.pause();
            resolve(true);
          }, 100);
        }
      } catch (e) {
        console.warn("[AUDIO] Error creating silent sound:", e.message);
        resolve(false);
      }
    });
  }

  /**
   * Configure audio for slow connections
   */
  _adjustForSlowConnection() {
    // Reduce sound priorities to load fewer sounds
    this.soundPriorities.background = this.soundPriorities.background.slice(0, 5);

    // Increase delays between loading
    this.baseDelays = {
      catchphrase: 500,
      grabWarning: 700,
      protest: 500,
      sobToProtest: 300,
    };
  }

  // Add this method to AudioManager
  _monitorAudioPoolSize() {
    const poolSize = window._primedAudioPool?.length || 0;
    const activeProtestorCount = Object.keys(this.activeProtestorSounds || {}).length;

    return {
      poolSize,
      activeProtestorCount,
      totalPlaying: this.currentlyPlaying.length,
    };
  }

  /**
   * Detect if the connection is slow
   */
  _detectSlowConnection() {
    // Check if we're on a slow connection
    if (navigator.connection) {
      // Use Network Information API if available
      const conn = navigator.connection;
      if (
        conn.type === "cellular" ||
        conn.effectiveType === "slow-2g" ||
        conn.effectiveType === "2g" ||
        conn.effectiveType === "3g" ||
        conn.saveData === true
      ) {
        return true;
      }
    }

    if (this.isMobile && !navigator.onLine) {
      return true;
    }

    return false;
  }

  _isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  _isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  /**
   * Detect if the device has low memory
   */
  _isLowMemoryDevice() {
    // Detect older/lower-end devices
    return (
      /Android 4\.|Android 5\.0|Android 5\.1/.test(navigator.userAgent) ||
      /iPhone; CPU iPhone OS (8_|9_|10_)/.test(navigator.userAgent) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 2)
    );
  }

  /**
   * Adjust sound paths for mobile devices
   */
  _adjustPathsForMobile() {
    // Use absolute paths for mobile
    const baseUrl = window.location.origin + window.location.pathname;
    this.soundPath = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1) + "sounds/";
  }

  /**
   * Resolve a sound file path
   */
  resolvePath(filename) {
    // Handle invalid inputs safely
    if (!filename) {
      return "";
    }

    // Handle arrays as a safety backup
    if (Array.isArray(filename)) {
      if (filename.length > 0) {
        filename = filename[0];
      } else {
        return "";
      }
    }

    // Ensure filename is a string
    if (typeof filename !== "string") {
      return "";
    }

    // For absolute URLs, return as is
    if (filename.startsWith("http") || filename.startsWith("/") || filename.startsWith("data:")) {
      return filename;
    }

    // See scripts/compress-audio.sh
    if ((this.isMobile || this.networkInfo.isSlowConnection) && window.AUDIO_LO_FILES && window.AUDIO_LO_FILES[filename]) {
      filename = window.AUDIO_LO_FILES[filename];
    }

    // Ensure sound path ends with a slash
    const path = this.soundPath.endsWith("/") ? this.soundPath : this.soundPath + "/";
    return path + filename;
  }

  // Creates/caches a GainNode for iOS volume
  _getGain(audioEl) {
    if (!audioEl || !this.audioContext) return null;

    let entry = this._gainNodes.get(audioEl);
    if (!entry) {
      try {
        const source = this.audioContext.createMediaElementSource(audioEl);
        const gain = this.audioContext.createGain();
        source.connect(gain).connect(this.audioContext.destination);
        entry = { source, gain };
        this._gainNodes.set(audioEl, entry);
      } catch (e) {
        console.warn("[AUDIO] Could not create gain node:", e.message);
        return null;
      }
    }
    return entry;
  }

  // Use for sounds with changing volume
  _setDynamicVolume(audioEl, vol) {
    if (!audioEl) return;
    const clamped = Math.max(0, Math.min(1, vol));
    const gainEntry = this._getGain(audioEl);
    if (gainEntry) {
      gainEntry.gain.gain.value = clamped;
      audioEl.volume = 1;
    } else {
      audioEl.volume = clamped;
    }
  }

  /**
   * Prepare the audio pool for reuse
   */
  _prepareAudioPool(count) {
    for (let i = 0; i < count; i++) {
      const audio = new Audio();
      audio.preload = "auto";
      window._primedAudioPool.push(audio);
    }
  }

  /**
   * Prime the audio pool for immediate playback
   */
  primeAudioPool(options = {}) {
    window._primedAudioPool = window._primedAudioPool || [];

    // Skip click sound if disabled
    if (!options.skipClickSound) {
      const clickAudio = new Audio(this.resolvePath("click.mp3"));
      clickAudio.volume = 0.3;

      clickAudio
        .play()
        .then(() => {
          // Return to pool after it's done
          clickAudio.onended = () => {
            window._primedAudioPool.push(clickAudio);
          };
        })
        .catch(() => {
          // Silently fail
        });
    }

    // Pre-load all slap sounds for immediate playback
    this._preloadInstantSlapSounds();

    this.preloadCriticalSounds();

    // Add generic audio elements
    for (let i = 0; i < 5; i++) {
      const audio = new Audio();
      window._primedAudioPool.push(audio);
    }

    return true;
  }

  _prepareAssetLoader() {
    this._allSoundPaths = new Set();
    this._flattenSoundFiles(this.soundFiles, this._allSoundPaths);
    this._flattenSoundFiles(this.trumpShoutsAtACountry, this._allSoundPaths);

    // Fill background with uncategorized sounds
    this._populateBackgroundSounds();
  }

  _flattenSoundFiles(obj, pathSet, prefix = "") {
    if (!obj) return;

    if (typeof obj === "string") {
      pathSet.add(prefix + obj);
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === "string") {
          pathSet.add(prefix + item);
        }
      });
      return;
    }

    // Object - recursively process
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        this._flattenSoundFiles(obj[key], pathSet, prefix);
      }
    }
  }

  /**
   * Populate background sounds list with non-priority sounds
   */
  _populateBackgroundSounds() {
    // Flatten priority sounds for fast lookup
    const immediateSet = new Set(this.soundPriorities.immediate);
    const criticalSet = new Set(this.soundPriorities.critical);
    const importantSet = new Set(this.soundPriorities.important);

    // Check each path against priority lists
    this._allSoundPaths.forEach((path) => {
      // Extract base filename without path
      const baseName = path.split("/").pop();

      // Non-priority sounds go to background
      if (!immediateSet.has(baseName) && !criticalSet.has(baseName) && !importantSet.has(baseName)) {
        this.soundPriorities.background.push(baseName);
      }
    });
  }

  /**
   * Load sounds by priority tier
   */
  _loadSoundsByPriority() {
    // Only load immediate/critical sounds first
    this._loadPrioritySounds("immediate");

    // Increase delay between critical and important sounds
    setTimeout(() => {
      this.preloadCriticalSounds();
    }, 100);

    // Longer mobile delay for less-important sounds
    const importantDelay = this.isMobile ? 2000 : 800;
    setTimeout(() => {
      this._loadPrioritySounds("important");
    }, importantDelay);

    // Background sounds load later, especially mobile
    const backgroundDelay = this.isMobile ? 5000 : 3000;
    setTimeout(() => {
      this._loadPrioritySounds("background", true);
    }, backgroundDelay);
  }

  /**
   * Load sounds of a specific priority group
   */
  _loadPrioritySounds(priorityGroup, slowLoading = false) {
    const sounds = this.soundPriorities[priorityGroup] || [];

    sounds.forEach((soundName, index) => {
      const delay = slowLoading ? index * 100 : 0;

      setTimeout(() => {
        this._loadSoundByName(soundName);
      }, delay);
    });
  }

  /**
   * Preload critical game sounds
   */
  preloadCriticalSounds() {
    if (this.debugInfo.criticalSoundsLoaded) return;

    // Ensure we're keeping track with a flag
    this.debugInfo.criticalSoundsLoaded = true;

    // Slap sounds are loaded by _preloadInstantSlapSounds() instead
    this._loadSoundWithPromise("trump", "trumpSmash", 0);

    const criticalPairs = [
      ["ui", "click"],
      ["ui", "gameStart"],
      // ["ui", "grabWarning"],
      // ["trump", "trumpGrabbing", 0],
    ];

    // Load critical sounds in parallel
    Promise.all(
      criticalPairs.map((pair) => {
        return this._loadSoundWithPromise(...pair);
      })
    )
      .then(() => {
        // Then load sounds needed early
        setTimeout(() => {
          // Important feedback sounds
          this._loadSoundWithPromise("trump", "partialAnnexCry", 0);
          this._loadSoundWithPromise("trump", "trumpSob", 0);
          this._loadSoundWithPromise("trump", "trumpYa", 0);
        }, 500);
      })
      .catch((error) => {
        console.warn("[AUDIO] Error in critical sound loading:", error);
      });
  }

  /**
   * Preload slap sounds for instant playback
   */
  _preloadInstantSlapSounds() {
    // Clear any existing cached slap sounds
    this._instantSlapSounds = [];

    // Preload all slap sounds with high priority
    this.soundFiles.defense.slap.forEach((slapFile, index) => {
      const slapAudio = new Audio(this.resolvePath(slapFile));
      slapAudio.preload = "auto";

      // Set up load handler
      slapAudio.oncanplaythrough = () => {
        // Store in both sound structure and cache
        if (!this.sounds.defense.slap) {
          this.sounds.defense.slap = [];
        }
        this.sounds.defense.slap[index] = slapAudio;

        // Add to dedicated instant cache
        this._instantSlapSounds.push(slapAudio);

        // Mark as loaded
        this.loadedSounds.add(`defense.slap.${index}`);
      };

      // Force load
      slapAudio.load();
    });

    // Also warm Web Audio buffer cache
    this._decodeSlapBuffers();
  }

  // Decodes slap files for fast playback
  _decodeSlapBuffers() {
    if (!this.audioContext || this._slapBuffers.length > 0) {
      return Promise.resolve();
    }

    const files = (this.soundFiles.defense && this.soundFiles.defense.slap) || [];
    return Promise.all(
      files.map((file) =>
        fetch(this.resolvePath(file))
          .then((res) => res.arrayBuffer())
          .then((data) => this.audioContext.decodeAudioData(data))
          .then((buffer) => this._slapBuffers.push(buffer))
          .catch((e) => console.warn(`[AUDIO] Could not decode slap buffer for ${file}:`, e.message))
      )
    );
  }

  startDiagnosticAuditing() {
    if (this._auditInterval) {
      clearInterval(this._auditInterval);
    }

    this._auditCount = 0;
    this._auditInterval = setInterval(() => {
      this._auditCount++;

      const stats = this._monitorAudioPoolSize();

      // Log full details every 5th time
      if (this._auditCount % 5 === 0) {
        console.log("[AUDIO AUDIT] ======= DETAILED AUDIO STATE =======");
        console.log("Active protestor sounds:", Object.keys(this.activeProtestorSounds));

        // Check for leaked elements
        let inPoolCount = window._primedAudioPool?.length || 0;
        let playingCount = this.currentlyPlaying.length;

        console.log(`[AUDIO AUDIT] Pool: ${inPoolCount}, Playing: ${playingCount}`);

        // Check for lingering protestor sounds
        const protestorSoundsStillPlaying = this.currentlyPlaying.filter((sound) => sound.src && sound.src.includes("protestors")).length;

        if (protestorSoundsStillPlaying > 0) {
          console.warn(`[AUDIO LEAK?] Found ${protestorSoundsStillPlaying} protestor sounds in currently playing array`);
        }
      }
    }, 3000); // Check every 3 seconds

    console.log("[AUDIO AUDIT] Started diagnostic auditing");
    return true;
  }

  _setupAudioElement(audio, options = {}) {
    if (!audio) return audio;

    // Apply standard properties
    audio.loop = options.loop || false;
    audio.muted = this.muted;
    audio.volume = options.volume !== undefined ? options.volume : this.volume;
    audio.playbackRate = options.playbackRate || 1.0;

    // Reset playback position if requested
    if (options.resetPosition) {
      audio.currentTime = 0;
    }

    return audio;
  }

  /**
   * Load a sound by name
   */
  _loadSoundByName(name) {
    // Skip if already loaded
    if (this._isSoundLoaded(name)) {
      console.log(`[AUDIO] Sound ${name} already loaded, skipping redownload`);
      return;
    }

    // Helper function to extract filename from path
    const getFilename = (path) => path.split("/").pop();

    // Check defense sounds first, slap is critical
    if (Array.isArray(this.soundFiles.defense.slap)) {
      for (let i = 0; i < this.soundFiles.defense.slap.length; i++) {
        const path = this.soundFiles.defense.slap[i];
        if (getFilename(path) === name) {
          this.loadSound("defense", "slap", i);
          return;
        }
      }
    }

    // Check UI sounds
    for (const soundName in this.soundFiles.ui) {
      const filename = getFilename(this.soundFiles.ui[soundName]);
      if (filename === name || soundName === name) {
        this.loadSound("ui", soundName);
        return;
      }
    }

    // Check trump sounds
    for (const category in this.soundFiles.trump) {
      if (Array.isArray(this.soundFiles.trump[category])) {
        this.soundFiles.trump[category].forEach((path, index) => {
          if (getFilename(path) === name) {
            this.loadSound("trump", category, index);
            return;
          }
        });
      } else if (getFilename(this.soundFiles.trump[category]) === name) {
        this.loadSound("trump", category);
        return;
      }
    }

    // Check music
    for (const soundName in this.soundFiles.music) {
      const filename = getFilename(this.soundFiles.music[soundName]);
      if (filename === name || soundName === name) {
        this.loadSound("music", soundName);
        return;
      }
    }
  }

  /**
   * @param {string} [preferredSrc] - Optional preferred source to match
   * @returns {HTMLAudioElement} - An audio element from the pool or a new one
   */
  _getOrCreatePrimedAudio(preferredSrc = null) {
    // Make sure pool exists
    if (!window._primedAudioPool) {
      window._primedAudioPool = [];
    }

    let audio = null;

    // Prefer an element with matching src
    if (preferredSrc && window._primedAudioPool.length > 0) {
      const sourceUrl = this.resolvePath(preferredSrc);
      for (let i = 0; i < window._primedAudioPool.length; i++) {
        if (window._primedAudioPool[i].src === sourceUrl) {
          // Found a matching source, use this element
          audio = window._primedAudioPool.splice(i, 1)[0];
          console.log(`[AUDIO POOL] Reused audio with matching src. Remaining: ${window._primedAudioPool.length}`);
          break;
        }
      }
    }

    // No match found, use any pooled element
    if (!audio) {
      audio = window._primedAudioPool.length > 0 ? window._primedAudioPool.pop() : new Audio();

      if (window._primedAudioPool.length > 0) {
      } else {
      }
    }

    // Reset properties, keep src if reused
    audio.loop = false;
    audio.muted = false;
    audio.currentTime = 0;
    audio.volume = 1.0;
    audio.playbackRate = 1.0;

    if (!preferredSrc) {
      audio.src = "";
    }

    return audio;
  }

  /**
   * @param {string} filename - The filename to check
   * @returns {boolean} - True if already loaded
   */
  _isSoundLoaded(filename) {
    if (!filename) return false;

    // Extract base filename from full path
    const baseName = filename.includes("/") ? filename.split("/").pop() : filename;

    // Check critical sounds cache first (fastest lookup)
    if (this._criticalSoundsCache[baseName]) {
      return true;
    }

    for (const category in this.sounds) {
      for (const name in this.sounds[category]) {
        const soundObj = this.sounds[category][name];

        // Handle array of sounds (like slap sounds)
        if (Array.isArray(soundObj)) {
          for (const sound of soundObj) {
            if (sound && sound.src && (sound.src.endsWith(baseName) || sound.src.includes(baseName))) {
              return true;
            }
          }
        }
        // Handle direct sound objects
        else if (soundObj && typeof soundObj === "object" && soundObj.src) {
          if (soundObj.src.endsWith(baseName) || soundObj.src.includes(baseName)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * @param {HTMLAudioElement} audio - The audio element to return to pool
   * @param {Object} options - Options for returning the audio
   */
  _returnAudioToPool(audio, options = {}) {
    if (!audio) return;

    try {
      // 1. Remove from tracking collections first
      const playingIndex = this.currentlyPlaying.indexOf(audio);
      if (playingIndex !== -1) {
        this.currentlyPlaying.splice(playingIndex, 1);
      }

      // 2. Stop playback
      audio.pause();

      // 3. Clear listeners to prevent leaks
      audio.onended = null;
      audio.oncanplay = null;
      audio.oncanplaythrough = null;
      audio.onerror = null;
      audio.onloadeddata = null;
      audio.onloadedmetadata = null;
      audio.onpause = null;
      audio.onplay = null;

      // 4. Reset audio element state
      audio.currentTime = 0;
      audio.loop = false;
      audio.volume = 1.0;
      audio.playbackRate = 1.0;
      audio.muted = false;

      // Reset gain, or reused element stays faded
      const gainEntry = this._gainNodes && this._gainNodes.get(audio);
      if (gainEntry) {
        gainEntry.gain.gain.value = 1.0;
      }

      if (options.clearSrc === true || audio.error) {
        audio.src = "";
      } else {
        audio._lastSrc = audio.src;
      }

      // 6. Return to pool if not full
      const MAX_POOL_SIZE = 20; // Set a reasonable limit
      if (window._primedAudioPool && window._primedAudioPool.length < MAX_POOL_SIZE) {
        window._primedAudioPool.push(audio);
      } else {
      }
    } catch (error) {
      console.warn("[AUDIO POOL] Error returning audio to pool:", error);
    }
  }

  /**
   * Play a sound with improved caching
   * @param {string} category - Sound category
   * @param {string} name - Sound name
   * @param {number} [volume] - Optional volume override
   * @returns {Promise<HTMLAudioElement|null>} - Promise resolving to the played audio or null
   */

  play(category, name, volume = null) {
    if (!this.initialized || this.muted) return Promise.resolve(null);

    this.debugInfo.playAttempts++;
    if (!this.debugInfo.firstPlayTimestamp) {
      this.debugInfo.firstPlayTimestamp = Date.now();
    }

    // Fast path: slap sounds are top priority
    if (category === "defense" && name === "slap") {
      // Skip context/promise wait for slap sounds
      return Promise.resolve(this._playInstantSlap(volume));
    }

    const soundKey = `${category}.${name}`;
    let sound = null;

    // Check all possible sound storage locations
    if (this._criticalSoundsCache[name]) {
      sound = this._criticalSoundsCache[name];
    } else if (this.sounds[category] && this.sounds[category][name]) {
      sound = this.sounds[category][name];
    }

    // Cached and confirmed loaded? Play it
    if (sound && this.loadedSounds.has(soundKey)) {
      return this._playAudioElement(sound, volume);
    }

    // No cached sound: resume context first
    return this.resumeAudioContext().then(() => {
      // Recheck cache after resume completes
      if (!sound) {
        // Recheck critical cache; may have loaded
        if (this._criticalSoundsCache[name]) {
          sound = this._criticalSoundsCache[name];
        } else if (this.sounds[category] && this.sounds[category][name]) {
          sound = this.sounds[category][name];
        }
      }

      // Found it now? Play it
      if (sound) {
        return this._playAudioElement(sound, volume);
      }

      // Determine sound path for loading if needed
      let soundPath = null;
      if (this.soundFiles[category] && this.soundFiles[category][name]) {
        soundPath = this.soundFiles[category][name];
      }

      // Not cached; check if already loading
      if (this.loadingPromises[soundKey]) {
        return this.loadingPromises[soundKey].then(() => {
          // After loading, try playing again from cache
          if (this.sounds[category] && this.sounds[category][name]) {
            return this._playAudioElement(this.sounds[category][name], volume);
          } else {
            // Loading failed; fall back to direct
            return this.playDirect(soundPath, volume);
          }
        });
      }

      // Not cached or loading; load it
      if (soundPath) {
        const isHighPriority =
          this.soundPriorities.immediate.includes(name) ||
          this.soundPriorities.critical.includes(name) ||
          this.soundPriorities.important.includes(name);

        if (isHighPriority) {
          // Load with promise for high priority sounds
          return this._loadSoundWithPromise(category, name).then(() => {
            if (this.sounds[category] && this.sounds[category][name]) {
              return this._playAudioElement(this.sounds[category][name], volume);
            } else {
              // Fall back to direct method
              return this.playDirect(soundPath, volume);
            }
          });
        } else {
          // Low priority: load in background, play now
          this.loadSound(category, name);
          return Promise.resolve(this.playDirect(soundPath, volume));
        }
      }

      // No sound found at all
      console.warn(`[AUDIO] Sound not found: ${category}.${name}`);
      return Promise.resolve(null);
    });
  }

  /**
   * @param {string} soundPath - Path to the sound file
   * @param {number} [volume] - Optional volume override
   * @returns {HTMLAudioElement|null} - The played audio element or null
   */
  playDirect(soundPath, volume = null) {
    if (!this.initialized || this.muted) return null;

    try {
      // Get pooled element, matched to source
      const audio = this._getOrCreatePrimedAudio(soundPath);

      // Set properties
      audio.loop = false;
      audio.muted = false;
      audio.currentTime = 0;

      const fullPath = this.resolvePath(soundPath);
      if (audio.src !== fullPath) {
        audio.src = fullPath;
      }

      audio.volume = volume !== null ? volume : this.volume;

      // Add to tracking
      this.currentlyPlaying.push(audio);

      // Set ended handler for cleanup
      audio.onended = () => {
        // Keep source by default when pooling
        this._returnAudioToPool(audio, { clearSrc: false });
      };

      // Play it
      const playPromise = audio.play();

      if (playPromise) {
        playPromise.catch((error) => {
          console.warn(`[AUDIO] Play failed for ${soundPath}:`, error);
          // Return to pool, clear src on error
          this._returnAudioToPool(audio, { clearSrc: true });
        });
      }

      return audio;
    } catch (e) {
      console.warn(`[AUDIO] Error in playDirect:`, e);
      return null;
    }
  }

  /**
   * @param {HTMLAudioElement} audioElement - The audio element to play
   * @param {number} volume - Optional volume override
   * @returns {Promise<HTMLAudioElement|null>} - Promise resolving to the played audio or null
   */
  _playAudioElement(audioElement, volume = null) {
    if (!audioElement || typeof audioElement.play !== "function") {
      return Promise.resolve(null);
    }

    // Don't restart if already playing
    const needsRestart = audioElement.paused || audioElement.ended || audioElement.currentTime > 0.1;

    if (needsRestart) {
      audioElement.currentTime = 0;
    }

    // Always update the volume
    audioElement.volume = volume !== null ? volume : this.volume;

    try {
      // Already playing? Just resolve
      if (!needsRestart && !audioElement.paused) {
        if (!this.currentlyPlaying.includes(audioElement)) {
          this.currentlyPlaying.push(audioElement);
        }
        return Promise.resolve(audioElement);
      }

      const playPromise = audioElement.play();

      // Add to currently playing
      if (!this.currentlyPlaying.includes(audioElement)) {
        this.currentlyPlaying.push(audioElement);
      }

      if (playPromise !== undefined) {
        return playPromise.catch((error) => {
          // Remove from currently playing if failed
          const index = this.currentlyPlaying.indexOf(audioElement);
          if (index !== -1) {
            this.currentlyPlaying.splice(index, 1);
          }

          // Fall back to direct method
          if (error.name === "NotAllowedError") {
            return this.playDirect(audioElement.src, volume);
          }

          return null;
        });
      }

      return Promise.resolve(audioElement);
    } catch (e) {
      // Remove from currently playing if failed
      const index = this.currentlyPlaying.indexOf(audioElement);
      if (index !== -1) {
        this.currentlyPlaying.splice(index, 1);
      }

      // Try direct play as fallback
      return Promise.resolve(this.playDirect(audioElement.src, volume));
    }
  }

  /**
   * @param {string} category - Sound category
   * @param {string} name - Sound name
   * @param {number|null} index - Optional index for array sounds
   * @returns {Promise<boolean>} - Promise resolving to success state
   */
  _loadSoundWithPromise(category, name, index = null) {
    // Create a unique key for this sound
    const soundKey = index !== null ? `${category}.${name}.${index}` : `${category}.${name}`;

    // Don't reload if already loaded
    if (this.loadedSounds.has(soundKey)) {
      return Promise.resolve(true);
    }

    // Return existing promise if already loading
    if (this.loadingPromises[soundKey]) {
      return this.loadingPromises[soundKey];
    }

    let soundPath;

    // Determine the sound path
    if (index !== null) {
      // Array sound
      if (!this.soundFiles[category] || !this.soundFiles[category][name] || !this.soundFiles[category][name][index]) {
        return Promise.resolve(false);
      }
      soundPath = this.soundFiles[category][name][index];
    } else {
      // Named sound
      if (!this.soundFiles[category] || !this.soundFiles[category][name]) {
        return Promise.resolve(false);
      }
      soundPath = this.soundFiles[category][name];
    }

    // Skip if already loaded elsewhere
    if (this._isSoundLoaded(soundPath)) {
      console.log(`[AUDIO] Sound ${soundPath} already loaded in another category, skipping redownload`);
      this.loadedSounds.add(soundKey); // Mark as loaded in this category too
      return Promise.resolve(true);
    }

    // Create and track the loading promise
    const loadPromise = new Promise((resolve, reject) => {
      try {
        let soundPath;
        let destination;

        if (index !== null) {
          // Array sound (like trump.grab[0])
          if (!this.soundFiles[category] || !this.soundFiles[category][name] || !this.soundFiles[category][name][index]) {
            return resolve(false);
          }

          soundPath = this.soundFiles[category][name][index];

          // Make sure the array exists
          if (!this.sounds[category][name]) {
            this.sounds[category][name] = [];
          }

          destination = this.sounds[category][name];
        } else {
          // Named sound (like ui.click)
          if (!this.soundFiles[category] || !this.soundFiles[category][name]) {
            return resolve(false);
          }

          soundPath = this.soundFiles[category][name];
          destination = this.sounds[category];
        }

        const audio = this._getOrCreatePrimedAudio(soundPath);
        audio.preload = "auto";

        // Track load success
        audio.oncanplaythrough = () => {
          if (index !== null) {
            // Push to array
            destination[index] = audio;
          } else {
            // Set named property
            destination[name] = audio;
          }

          this.loadedSounds.add(soundKey);
          delete this.loadingPromises[soundKey];

          // Slap sounds also join instant cache
          if (category === "defense" && name === "slap") {
            if (!this._instantSlapSounds) {
              this._instantSlapSounds = [];
            }
            if (!this._instantSlapSounds.includes(audio)) {
              this._instantSlapSounds.push(audio);
            }
          }

          // Cache critical sounds separately
          const filename = soundPath.split("/").pop();
          if (
            this.soundPriorities.immediate.includes(filename) ||
            this.soundPriorities.critical.includes(filename) ||
            this.soundPriorities.critical.includes(name)
          ) {
            this._criticalSoundsCache[name] = audio;
          }

          resolve(true);
        };

        // Error handler
        audio.onerror = (e) => {
          console.error(`[AUDIO] Error loading sound ${soundPath}`);
          delete this.loadingPromises[soundKey];
          resolve(false);
        };

        // Set source and load only if different
        const fullPath = this.resolvePath(soundPath);
        if (audio.src !== fullPath) {
          audio.src = fullPath;
          audio.load();
        }
      } catch (error) {
        console.error(`[AUDIO] Error in sound loading: ${error.message}`);
        delete this.loadingPromises[soundKey];
        resolve(false);
      }
    });

    // Store the promise for future reference
    this.loadingPromises[soundKey] = loadPromise;

    return loadPromise;
  }

  /**
   * Load a sound into the cache
   */
  loadSound(category, name, index = null) {
    const soundKey = index !== null ? `${category}.${name}.${index}` : `${category}.${name}`;

    // Skip if already loaded
    if (this.loadedSounds.has(soundKey)) {
      return null;
    }

    let soundPath;
    let destination;

    try {
      if (index !== null) {
        // Array sound (like trump.grab[0])
        if (!this.soundFiles[category] || !this.soundFiles[category][name] || !this.soundFiles[category][name][index]) {
          return null;
        }

        soundPath = this.soundFiles[category][name][index];

        // Skip if already loaded elsewhere
        if (this._isSoundLoaded(soundPath)) {
          console.log(`[AUDIO] Sound ${soundPath} already loaded in another category, skipping redownload`);
          this.loadedSounds.add(soundKey); // Mark as loaded in this category too
          return null;
        }

        // Make sure the array exists
        if (!this.sounds[category][name]) {
          this.sounds[category][name] = [];
        }

        destination = this.sounds[category][name];
      } else {
        // Named sound (like ui.click)
        if (!this.soundFiles[category] || !this.soundFiles[category][name]) {
          return null;
        }

        soundPath = this.soundFiles[category][name];

        // Check if already loaded elsewhere
        if (this._isSoundLoaded(soundPath)) {
          console.log(`[AUDIO] Sound ${soundPath} already loaded in another category, skipping redownload`);
          this.loadedSounds.add(soundKey); // Mark as loaded in this category too
          return null;
        }

        destination = this.sounds[category];
      }

      // Create/load audio, preferring pooled element
      const audio = this._getOrCreatePrimedAudio();
      audio.preload = "auto";

      // Track load success
      audio.oncanplaythrough = () => {
        if (index !== null) {
          // Store in array
          if (index >= destination.length) {
            // Fill array up to this index
            for (let i = destination.length; i < index; i++) {
              destination[i] = null;
            }
            destination[index] = audio;
          } else {
            destination[index] = audio;
          }
        } else {
          // Store as property
          destination[name] = audio;
        }

        this.loadedSounds.add(soundKey);

        // Slap sounds also join instant cache
        if (category === "defense" && name === "slap") {
          if (!this._instantSlapSounds) {
            this._instantSlapSounds = [];
          }
          this._instantSlapSounds.push(audio);
        }

        // Add to critical cache if it's critical
        const filename = soundPath.split("/").pop();
        if (
          this.soundPriorities.immediate.includes(filename) ||
          this.soundPriorities.critical.includes(filename) ||
          this.soundPriorities.critical.includes(name)
        ) {
          this._criticalSoundsCache[name] = audio;
        }
      };

      // Error handler
      audio.onerror = (e) => {
        console.error(`[AUDIO] Error loading sound ${soundPath}`);
      };

      // Set source and load
      audio.src = this.resolvePath(soundPath);
      audio.load();

      return audio;
    } catch (error) {
      console.error(`[AUDIO] Error loading sound: ${error.message}`);
      return null;
    }
  }

  /**
   * Load a catchphrase sound
   */
  loadCatchphrase(country, index) {
    const soundKey = `catchphrase.${country}.${index}`;

    if (this.loadedSounds.has(soundKey)) {
      return null;
    }

    if (!this.trumpShoutsAtACountry || !this.trumpShoutsAtACountry[country] || !this.trumpShoutsAtACountry[country][index]) {
      return null;
    }

    try {
      // Ensure the country array exists
      if (!this.catchphrases) {
        this.catchphrases = {};
      }

      if (!this.catchphrases[country]) {
        this.catchphrases[country] = [];
      }

      const soundPath = this.trumpShoutsAtACountry[country][index];
      const audio = this._getOrCreatePrimedAudio();
      audio.preload = "auto";
      audio.src = this.resolvePath(soundPath);

      audio.oncanplaythrough = () => {
        this.catchphrases[country][index] = audio;
        this.loadedSounds.add(soundKey);
      };

      audio.load();
      return audio;
    } catch (error) {
      console.error(`[AUDIO] Error loading catchphrase: ${error.message}`);
      return null;
    }
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getProtestSoundDuration(fileName) {
    const rawMs = PROTEST_CLIP_DURATIONS_MS[fileName] || DEFAULT_PROTEST_CLIP_DURATION_MS;
    return Math.round(rawMs * PROTEST_CLIP_DURATION_SCALE);
  }

  // Picks the clip playSuccessfulBlock will use
  pickProtestSound(country) {
    const file = this._getShuffledSound("defense", "peopleSayNo", country);
    return { file, durationMs: file ? this.getProtestSoundDuration(file) : DEFAULT_PROTEST_CLIP_DURATION_MS };
  }

  /**
   * Get a shuffled sound from a category
   */
  _getShuffledSound(category, subcategory, country = null) {
    // Determine which array to use
    let soundArray;
    let soundKey;

    try {
      if (category === "particles" && subcategory === "freedom") {
        soundArray = this.soundFiles.particles?.freedom;
        soundKey = "particles.freedom";
      } else if (country && subcategory === "peopleSayNo") {
        const countrySaysNo = country.endsWith("SaysNo") ? country : country + "SaysNo";
        soundArray = this.soundFiles.defense?.peopleSayNo?.[countrySaysNo];
        soundKey = `defense.peopleSayNo.${countrySaysNo}`;
      } else if (category === "resistance" && subcategory) {
        soundArray = this.soundFiles.resistance?.[subcategory];
        soundKey = `resistance.${subcategory}`;
      } else if (category === "catchphrase") {
        soundArray = this.trumpShoutsAtACountry?.[subcategory] || this.trumpShoutsAtACountry?.generic;
        soundKey = `catchphrase.${subcategory}`;
      } else if (category === "trump" && subcategory) {
        soundArray = this.soundFiles.trump?.[subcategory];
        soundKey = `trump.${subcategory}`;
      } else if (this.soundFiles?.[category]?.[subcategory]) {
        soundArray = this.soundFiles[category][subcategory];
        soundKey = `${category}.${subcategory}`;
      }

      // If no sounds available, return null
      if (!soundArray || soundArray.length === 0) {
        return null;
      }

      if (!Array.isArray(soundArray)) {
        return soundArray;
      }

      if (soundArray.length === 1) {
        return soundArray[0];
      }

      // Create shuffle array if missing
      if (!this.shuffleTracking.arrays[soundKey]) {
        // Create an array of indices
        const indices = Array.from({ length: soundArray.length }, (_, i) => i);

        // Shuffle the indices
        this.shuffleTracking.arrays[soundKey] = this._shuffleArray(indices);
        this.shuffleTracking.indices[soundKey] = 0;
      }

      const position = this.shuffleTracking.indices[soundKey] || 0;

      // Get the index from the shuffled array
      const soundIndex = this.shuffleTracking.arrays[soundKey][position];

      // Increment position
      this.shuffleTracking.indices[soundKey] = (position + 1) % soundArray.length;

      // Return a single sound file path
      return soundArray[soundIndex];
    } catch (error) {
      // Fallback: return the first sound in array
      if (Array.isArray(soundArray) && soundArray.length > 0) {
        return soundArray[0];
      }

      return null;
    }
  }

playRandom(category, subcategory, country = null, volume = null) {
  if (!this.initialized || this.muted) return null;

  // Use progressive loading for protest sounds
  const soundFile = this._getShuffledSoundWithProgressiveLoad(category, subcategory, country);
  if (!soundFile) return null;

  if (category === "defense" && subcategory === "slap") {
    return this._playInstantSlap(volume);
  }

  return this.playDirect(soundFile, volume);
}

  _playInstantSlap(volume = null) {
    if (this.muted) return null;
    const targetVolume = volume !== null ? volume : this.volume;

    // Fast path via Web Audio buffer
    if (this.audioContext && this.audioContext.state === "running" && this._slapBuffers.length > 0) {
      try {
        const buffer = this._slapBuffers[Math.floor(Math.random() * this._slapBuffers.length)];
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.detune.value = (Math.random() * 2 - 1) * 8; // +/-8 cents of variety
        const gain = this.audioContext.createGain();
        gain.gain.value = Math.max(0, Math.min(1, targetVolume));
        source.connect(gain).connect(this.audioContext.destination);
        source.start();
        return source;
      } catch (e) {
        console.warn("[AUDIO] Web Audio slap playback failed, falling back:", e.message);
      }
    }

    // If we have instant slap sounds ready
    if (this._instantSlapSounds && this._instantSlapSounds.length > 0) {
      // Get random slap sound from cache
      const randomIndex = Math.floor(Math.random() * this._instantSlapSounds.length);
      const slapSound = this._instantSlapSounds[randomIndex];

      if (slapSound) {
        // Clone so overlapping hits don't wait
        const clonedSlap = slapSound.cloneNode();
        clonedSlap.volume = targetVolume;

        try {
          clonedSlap.play();
        } catch (e) {
          // ignore
        }

        // Add to currently playing
        this.currentlyPlaying.push(clonedSlap);

        // Set up cleanup handler
        clonedSlap.onended = () => {
          const index = this.currentlyPlaying.indexOf(clonedSlap);
          if (index !== -1) {
            this.currentlyPlaying.splice(index, 1);
          }

          // Clean up this temporary clone
          clonedSlap.onended = null;
        };

        return clonedSlap;
      }
    }

    // Fall back to direct if cache unavailable
    const slapPath = this.soundFiles.defense.slap[0];
    return this.playDirect(slapPath, targetVolume);
  }

  /**
   * Play grab warning sound with delay
   */
  playGrabWarning(volume = null) {
    if (this.muted) return null;

    // Scale warning time based on game speed
    const scaledWarningTime = this.baseDelays.grabWarning / Math.max(1, this.gameSpeed);

    setTimeout(() => {
      return this.play("ui", "grabWarning", volume);
    }, scaledWarningTime);
  }

  /**
   * Play grab attempt sound
   */
  playGrabAttempt(country, initialVolume = null) {
    if (this.muted) return null;

    // Stop any existing grab sound
    this.stopGrabSound();

    // Set initial grab volume if provided
    if (initialVolume !== null) {
      this.currentGrabVolume = initialVolume;
    }

    // Try to play from cached first
    if (this._criticalSoundsCache["trumpGrabbing1"]) {
      const grabSound = this._criticalSoundsCache["trumpGrabbing1"];
      grabSound.currentTime = 0;
      this._setDynamicVolume(grabSound, this.currentGrabVolume * this.volume);
      grabSound.loop = true;

      const playPromise = grabSound.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.activeGrabSound = grabSound;
            this.currentlyPlaying.push(grabSound);

            // Start increasing volume gradually
            this.grabVolumeInterval = setInterval(() => {
              if (this.activeGrabSound) {
                this.currentGrabVolume = Math.min(this.maxGrabVolume, this.currentGrabVolume + this.grabVolumeStep);
                this._setDynamicVolume(this.activeGrabSound, this.currentGrabVolume * this.volume);
              }
            }, 300);

            return grabSound;
          })
          .catch(() => {
            // Fallback to standard play
            return this._standardGrabAttempt(country, initialVolume);
          });
      }

      return Promise.resolve(grabSound);
    } else {
      // Standard approach
      return this._standardGrabAttempt(country, initialVolume);
    }
  }

  /**
   * Standard grab attempt sound playback
   */
  _standardGrabAttempt(country, initialVolume) {
    return this.play("trump", "trumpGrabbing", this.currentGrabVolume * this.volume).then((grabSound) => {
      if (grabSound) {
        grabSound.loop = true;
        this.activeGrabSound = grabSound;

        // Start increasing volume gradually
        this.grabVolumeInterval = setInterval(() => {
          if (this.activeGrabSound) {
            this.currentGrabVolume = Math.min(this.maxGrabVolume, this.currentGrabVolume + this.grabVolumeStep);
            this._setDynamicVolume(this.activeGrabSound, this.currentGrabVolume * this.volume);
          }
        }, 300);
      }
      return grabSound;
    });
  }

  /**
   * Stop grab sound
   */
  stopGrabSound() {
    // Clear the volume increase interval
    if (this.grabVolumeInterval) {
      clearInterval(this.grabVolumeInterval);
      this.grabVolumeInterval = null;
    }

    // Stop active grab sound
    if (this.activeGrabSound) {
      this.activeGrabSound.pause();
      this.activeGrabSound.currentTime = 0;

      // Remove from currently playing sounds
      const index = this.currentlyPlaying.indexOf(this.activeGrabSound);
      if (index !== -1) {
        this.currentlyPlaying.splice(index, 1);
      }

      this.activeGrabSound = null;

      // Reset grab volume for next time
      this.currentGrabVolume = 0.2;
    }
  }

  _sanitizeGameSpeed() {
    return Math.max(1, Number(this.gameSpeed) || 1);
  }

  playSuccessfulGrab(country, volume = null) {
    if (this.muted) return null;

    // Sanitize game speed to ensure positive number
    const gameSpeedMultiplier = this._sanitizeGameSpeed();

    this.stopGrabSound();

    return this.resumeAudioContext().then(() => {
      const audioSequence = [
        {
          type: "breaking",
          getFile: () => this._getShuffledSound("trump", "trumpSmash"),
          baseDuration: 0.5,
        },
        {
          type: "annex",
          getFile: () => this._getShuffledSound("trump", "partialAnnexCry"),
          baseDuration: 1.6,
        },
        {
          type: "ya",
          getFile: () => this._getShuffledSound("trump", "trumpYa"),
          baseDuration: 1.0,
        },
      ];

      // Unified audio playback method
      const playAudioSequence = () => {
        let totalElapsedTime = 0;

        audioSequence.forEach((soundItem) => {
          const adjustedDelay = Math.max(0, totalElapsedTime / gameSpeedMultiplier);

          setTimeout(() => {
            const soundFile = soundItem.getFile();
            const playedSound = this.playDirect(soundFile, volume);
            console.log(`Playing ${soundItem.type} sound: ${soundFile}`);
          }, adjustedDelay * 1000);

          // Accumulate time, adjusted by game speed
          totalElapsedTime += soundItem.baseDuration / gameSpeedMultiplier;
        });
      };

      // Trigger audio sequence
      playAudioSequence();
    });
  }

  playSuccessfulBlock(country, volume = null, preSelectedProtestFile = null) {
    // Immediately play the slap sound
    this._playInstantSlap(volume);

    this.stopGrabSound();

    // Sanitize game speed to ensure positive number
    const gameSpeedMultiplier = this._sanitizeGameSpeed();

    // Queue additional sounds after the slap
    setTimeout(() => {
      this.resumeAudioContext().then(() => {
        // Define sound sequence with base delays
        const soundSequence = [
          {
            type: "sob",
            getFile: () => this._getShuffledSound("trump", "trumpSob"),
            baseDelay: this.baseDelays.sobToProtest,
          },
          {
            type: "protest",
            getFile: () => preSelectedProtestFile || this._getShuffledSound("defense", "peopleSayNo", country),
            baseDelay: this.baseDelays.protest,
          },
        ];

        let totalElapsedTime = 0;

        soundSequence.forEach((soundItem) => {
          const adjustedDelay = Math.max(0, totalElapsedTime / gameSpeedMultiplier);

          setTimeout(() => {
            const soundFile = soundItem.getFile();
            this.playDirect(soundFile, volume);
            console.log(`Playing ${soundItem.type} sound: ${soundFile}`);
          }, adjustedDelay * 1000);

          // Accumulate time, adjusted by game speed
          totalElapsedTime += soundItem.baseDelay / gameSpeedMultiplier;
        });
      });
    }, 0);

    return Promise.resolve(true);
  }

  playCountryFullyAnnexedCry(country, volume = null) {
    if (this.muted) return null;

    // Sanitize game speed to ensure positive number
    const gameSpeedMultiplier = this._sanitizeGameSpeed();

    this.stopGrabSound(); // Stop any ongoing grab sounds

    return this.resumeAudioContext().then(() => {
      const audioSequence = [
        {
          type: "breaking",
          getFile: () => this._getShuffledSound("trump", "trumpSmash"),
          baseDuration: 0.5,
          tinyPause: 0.1, // Optional pause between sounds
        },
        {
          type: "fullAnnex",
          getFile: () => this._getShuffledSound("trump", "fullAnnexCry"),
          baseDuration: 3.5, // Longest duration + small buffer
        },
        {
          type: "victory",
          getFile: () => this._getShuffledSound("trump", "trumpVictorySounds"),
          baseDuration: 1.0, // Default duration for victory sound
        },
      ];

      // Unified audio playback method
      const playAudioSequence = () => {
        let totalElapsedTime = 0;

        audioSequence.forEach((soundItem, index) => {
          const adjustedDelay = Math.max(0, totalElapsedTime / gameSpeedMultiplier);

          setTimeout(() => {
            const soundFile = soundItem.getFile();
            const playedSound = this.playDirect(soundFile, volume);
            console.log(`Playing ${soundItem.type} sound: ${soundFile}`);
          }, adjustedDelay * 1000);

          const additionalPause = index === 0 ? soundItem.tinyPause || 0 : 0;
          totalElapsedTime += (soundItem.baseDuration + additionalPause) / gameSpeedMultiplier;
        });
      };

      // Trigger audio sequence
      playAudioSequence();
    });
  }
  /**
   * Play a catchphrase for a country
   */
  playCatchphrase(country, volume = null) {
    if (this.muted) return null;

    // Always ensure AudioContext is resumed first
    return this.resumeAudioContext().then(() => {
      // Handle eastCanada and westCanada as canada
      const actualCountry = country === "eastCanada" || country === "westCanada" ? "canada" : country;

      // Get catchphrase files array
      const catchphrases = this.trumpShoutsAtACountry[actualCountry] || this.trumpShoutsAtACountry.generic;

      if (!catchphrases || catchphrases.length === 0) {
        return null;
      }

      // Get shuffled sound rather than random
      const soundFile = this._getShuffledSound("catchphrase", actualCountry);

      // Play directly using the correct path
      return this.playDirect(soundFile, volume);
    });
  }

  /**
   * Play sound for growing protestors
   */
  playGrowProtestorsSound(volume = null) {
    if (this.muted) return null;

    // Always ensure AudioContext is resumed first
    return this.resumeAudioContext().then(() => {
      return this.playDirect(this.soundFiles.ui.growProtestors, volume);
    });
  }

  fadeTo(audio, targetVolume, duration, callback = null) {
    if (!audio) return null;

    // Gain-controlled audio pins volume; read gain instead
    const existingGain = this._gainNodes.get(audio);
    const startVolume = existingGain ? existingGain.gain.gain.value : audio.volume;
    const volumeDiff = targetVolume - startVolume;
    const startTime = performance.now();

    // Generate a unique ID for this fade
    const fadeId = Date.now() + Math.random().toString(36).substr(2, 5);

    if (this._fadeIntervals[fadeId]) {
      clearInterval(this._fadeIntervals[fadeId]);
    }

    // Create a new interval
    const fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply volume (check if audio still exists)
      if (audio) {
        this._setDynamicVolume(audio, startVolume + volumeDiff * progress);
      }

      // If complete or audio no longer exists
      if (progress >= 1 || !audio) {
        clearInterval(fadeInterval);
        delete this._fadeIntervals[fadeId];

        // Stop audio if faded to zero
        if (audio && targetVolume <= 0.02) {
          audio.pause();
          audio.currentTime = 0;
        }

        // Execute callback if provided
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    }, 50);

    // Store the interval with unique ID
    this._fadeIntervals[fadeId] = fadeInterval;

    return fadeInterval;
  }

  startBackgroundMusic(volume = null) {
    if (!this.initialized || this.muted) return Promise.resolve(false);

    // First stop any existing background music
    this.stopBackgroundMusic();

    // Resume AudioContext first (mobile requirement)
    return this.resumeAudioContext().then(() => {
      try {
        // Get an audio element from the pool
        const music = this._getOrCreatePrimedAudio();

        // Configure it
        music.loop = true;
        music.src = this.resolvePath(this.soundFiles.music.background);
        this._setDynamicVolume(music, volume !== null ? volume : this.volume * 0.5); // Lower default volume

        return music
          .play()
          .then(() => {
            // Store references
            this.backgroundMusic = music;
            this.backgroundMusicPlaying = true;
            this.currentlyPlaying.push(music);

            // Set up error recovery
            music.onerror = () => {
              console.warn(`[AUDIO] Background music error, attempting recover`);
              this.stopBackgroundMusic();
              this.startBackgroundMusic(volume);
            };

            return true;
          })
          .catch((error) => {
            console.warn(`[AUDIO] Background music play failed:`, error);
            this._returnAudioToPool(music);

            // On mobile, set up auto-recovery
            if (this.isMobile) {
              document.addEventListener(
                "click",
                () => {
                  if (!this.backgroundMusicPlaying) {
                    this.startBackgroundMusic(volume);
                  }
                },
                { once: true }
              );
            }

            return false;
          });
      } catch (e) {
        console.warn(`[AUDIO] Error creating background music:`, e);
        return Promise.resolve(false);
      }
    });
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      console.log(`[AUDIO] Stopping background music`);

      const music = this.backgroundMusic;

      // Clear references first
      this.backgroundMusic = null;
      this.backgroundMusicPlaying = false;

      // Use our centralized cleanup
      this._returnAudioToPool(music);
    }
  }
  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;

    // Apply to all currently playing sounds
    this.currentlyPlaying.forEach((sound) => {
      sound.muted = this.muted;
    });

    // Apply to background music
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.muted;
    }

    // Stop grab sound interval if muted
    if (this.muted && this.grabVolumeInterval) {
      clearInterval(this.grabVolumeInterval);
      this.grabVolumeInterval = null;
    }

    return this.muted;
  }

  /**
   * Set global volume
   */
  setVolume(volume) {
    // Clamp to valid range
    this.volume = Math.max(0, Math.min(1, volume));

    // Apply to all currently playing sounds
    this.currentlyPlaying.forEach((sound) => {
      this._setDynamicVolume(sound, this.volume);
    });

    // Apply to background music
    if (this.backgroundMusic) {
      this._setDynamicVolume(this.backgroundMusic, this.volume * 0.5);
    }

    // Update grab sound volume if active
    if (this.activeGrabSound) {
      this._setDynamicVolume(this.activeGrabSound, this.currentGrabVolume * this.volume);
    }
  }

  setGameSpeed(speed) {
    this.gameSpeed = speed;
  }

  /**
   * Stop all sounds except background music
   */
  stopAllExceptBackgroundMusic() {
    // Save background music reference before stopping
    const bgMusic = this.backgroundMusic;

    this.currentlyPlaying.forEach((sound) => {
      // Skip background music
      if (sound !== bgMusic) {
        try {
          sound.pause();
          sound.currentTime = 0;
          // Remove onended callback to prevent further handling
          sound.onended = null;
        } catch (e) {
          console.warn("[AUDIO] Error stopping sound in stopAllExceptBackgroundMusic:", e);
        }
      }
    });

    this.currentlyPlaying = this.currentlyPlaying.filter((sound) => sound === bgMusic);

    this.stopGrabSound();

    // Clear fades except background music's
    Object.keys(this._fadeIntervals).forEach((key) => {
      if (!key.includes("backgroundMusic")) {
        clearInterval(this._fadeIntervals[key]);
        delete this._fadeIntervals[key];
      }
    });

    // Clear active grab sound and interval
    if (this.grabVolumeInterval) {
      clearInterval(this.grabVolumeInterval);
      this.grabVolumeInterval = null;
    }
    this.activeGrabSound = null;

    // Reset grab volume for next time
    this.currentGrabVolume = 0.2;
  }

  /**
   * Pause all sounds
   */
  pauseAll() {
    // Always try to maintain AudioContext state
    if (this.audioContext && this.audioContext.state === "running") {
      try {
        // Suspend AudioContext to prevent unnecessary processing
        this.audioContext.suspend().catch(console.warn);
      } catch (e) {
        console.warn("[AUDIO] Could not suspend AudioContext:", e.message);
      }
    }

    // Pause background music
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      // Store the playing state for potential resume
      this.backgroundMusic._wasPlaying = true;
      this.backgroundMusic.pause();
    }

    // Pause all currently playing sounds
    this.currentlyPlaying.forEach((sound) => {
      if (sound && !sound.paused && typeof sound.pause === "function") {
        sound.pause();
      }
    });

    // Pause grab sound interval
    if (this.grabVolumeInterval) {
      clearInterval(this.grabVolumeInterval);
      this.grabVolumeInterval = null;
    }

    // Stop all protestor sounds
    // this.stopAllProtestorSounds();
  }

  /**
   * Resume all sounds
   */
  resumeAll() {
    // Safely resume AudioContext (critical for mobile/Safari)
    this.resumeAudioContext().then((contextResumed) => {
      if (!contextResumed) {
        console.warn("[AUDIO] Could not resume AudioContext");
      }

      // Resume background music if it was playing
      if (this.backgroundMusic && this.backgroundMusicPlaying) {
        this.backgroundMusic.play().catch((e) => {
          console.warn(`[AUDIO] Could not resume background music:`, e.message);
        });
      }

      // Resume grab sound if it was active
      if (this.activeGrabSound) {
        this.activeGrabSound.play().catch((e) => {
          console.warn(`[AUDIO] Could not resume grab sound:`, e.message);
        });

        // Restart volume interval
        this.grabVolumeInterval = setInterval(() => {
          if (this.activeGrabSound) {
            this.currentGrabVolume = Math.min(this.maxGrabVolume, this.currentGrabVolume + this.grabVolumeStep);
            this._setDynamicVolume(this.activeGrabSound, this.currentGrabVolume * this.volume);
          }
        }, 300);
      }
    });
  }

  /**
   * Stop all sounds
   */
  stopAll(options = {}) {
    // Stop and clear all currently playing sounds
    this.currentlyPlaying.forEach((sound) => {
      if (sound && typeof sound.pause === "function") {
        sound.pause();
        sound.currentTime = 0;
        sound.onended = null; // Clear callback
        sound.src = ""; // Release memory
      }
    });
    this.currentlyPlaying = [];

    // Stop background music if not excepted
    if (!options.exceptBackgroundMusic) {
      this.stopBackgroundMusic();
    }

    // Stop grab sound
    this.stopGrabSound();

    Object.keys(this._fadeIntervals).forEach((key) => {
      clearInterval(this._fadeIntervals[key]);
    });
    this._fadeIntervals = {};
  }

  fullReset() {
    // First stop everything that's currently playing
    this.stopAll();

    // Clear tracking collections
    this.currentlyPlaying = [];
    this.activeProtestorSounds = {};
    this.loadedSounds = new Set();
    this.loadingPromises = {};

    // Clear the criticalSoundsCache
    this._criticalSoundsCache = {};

    this.sounds = {
      ui: {},
      trump: {
        trumpGrabbing: [],
        partialAnnexCry: [],
        fullAnnexCry: [],
        trumpVictorySounds: [],
        trumpSob: [],
      },
      defense: {
        slap: [],
        peopleSayNo: {
          eastCanadaSaysNo: [],
          westCanadaSaysNo: [],
          mexicoSaysNo: [],
          greenlandSaysNo: [],
        },
        protestors: {
          eastCanadaProtestors: null,
          westCanadaProtestors: null,
          mexicoProtestors: null,
          greenlandProtestors: null,
          usaProtestors: null,
        },
      },
      resistance: {
        canada: [],
        mexico: [],
        greenland: [],
      },
      particles: {
        freedom: [],
      },
      music: {},
    };

    // Clear the instant slap sounds cache
    this._instantSlapSounds = [];

    // Clear fade intervals
    Object.keys(this._fadeIntervals).forEach((key) => {
      clearInterval(this._fadeIntervals[key]);
    });
    this._fadeIntervals = {};

    // Reset state variables
    this.grabVolumeInterval = null;
    this.currentGrabVolume = 0.2;
    this.activeGrabSound = null;

    // Reset the background music variables
    this.backgroundMusic = null;
    this.backgroundMusicPlaying = false;

    // Reset but preserve the audio context
    this.resumeAudioContext().then(() => {
      // Reload critical sounds
      this.preloadCriticalSounds();

      // Rebuild the instant slap sounds cache
      this._preloadInstantSlapSounds();
    });
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this._auditInterval) {
      clearInterval(this._auditInterval);
      this._auditInterval = null;
    }
    // Stop all sounds first
    this.stopAll();

    // Clear any intervals
    if (this.grabVolumeInterval) {
      clearInterval(this.grabVolumeInterval);
      this.grabVolumeInterval = null;
    }

    Object.keys(this._fadeIntervals).forEach((key) => {
      clearInterval(this._fadeIntervals[key]);
    });
    this._fadeIntervals = {};

    // Close audio context if possible
    if (this.audioContext && typeof this.audioContext.close === "function") {
      this.audioContext.close().catch((e) => {
        console.warn(`[AUDIO] Error closing AudioContext:`, e.message);
      });
    }
  }

  /**
   * Load sounds for a specific country
   */
  loadCountrySounds(country) {
    // Determine which country we're actually targeting
    let targetCountry = country;

    // Special handling for Canada regions
    if (country === "eastCanada" || country === "westCanada") {
      targetCountry = "canada";
    }

    // Load corresponding resistance sounds
    if (this.soundFiles.resistance[targetCountry]) {
      const soundArray = this.soundFiles.resistance[targetCountry];
      for (let i = 0; i < Math.min(2, soundArray.length); i++) {
        this.loadSound("resistance", targetCountry, i);
      }
    }

    // Load corresponding protest sounds
    if (country === "canada") {
      this._preloadProtestSoundsForCountry("eastCanada");
      this._preloadProtestSoundsForCountry("westCanada");
    } else {
      this._preloadProtestSoundsForCountry(country);
    }

    // Load catchphrase sounds
    if (this.trumpShoutsAtACountry[targetCountry]) {
      for (let i = 0; i < Math.min(2, this.trumpShoutsAtACountry[targetCountry].length); i++) {
        this.loadCatchphrase(targetCountry, i);
      }
    }
  }

_preloadProtestSoundsForCountry(country) {
  const countrySaysNo = country.endsWith("SaysNo") ? country : country + "SaysNo";

  const protestorKey = country + "Protestors";
  if (this.soundFiles.defense?.protestors?.[protestorKey]) {
    const path = this.soundFiles.defense.protestors[protestorKey];
    const audio = new Audio(this.resolvePath(path));
    audio.preload = "auto";

    audio.oncanplaythrough = () => {
      if (!this.sounds.defense.protestors) {
        this.sounds.defense.protestors = {};
      }
      this.sounds.defense.protestors[protestorKey] = audio;
      this.loadedSounds.add(`defense.protestors.${protestorKey}`);
    };

    audio.load();
  }

  // Load only initial batch of sayNo sounds
  const sayNoSounds = this.soundFiles.defense?.peopleSayNo?.[countrySaysNo];
  if (Array.isArray(sayNoSounds) && sayNoSounds.length > 0) {
    const initialLoadCount = this.progressiveLoading.config.initialLoadCount;
    
    // Ensure destination exists
    if (!this.sounds.defense.peopleSayNo) {
      this.sounds.defense.peopleSayNo = {};
    }
    if (!this.sounds.defense.peopleSayNo[countrySaysNo]) {
      this.sounds.defense.peopleSayNo[countrySaysNo] = [];
    }

    // Load initial sounds
    for (let i = 0; i < Math.min(initialLoadCount, sayNoSounds.length); i++) {
      setTimeout(() => {
        const audio = new Audio(this.resolvePath(sayNoSounds[i]));
        audio.preload = "auto";

        audio.oncanplaythrough = () => {
          this.sounds.defense.peopleSayNo[countrySaysNo][i] = audio;
          this.loadedSounds.add(`defense.peopleSayNo.${countrySaysNo}.${i}`);
          this.progressiveLoading.peopleSayNo[countrySaysNo].loaded++;
        };

        audio.load();
      }, i * 100);
    }

    console.log(`[AUDIO] Initial load: ${initialLoadCount}/${sayNoSounds.length} ${countrySaysNo} sounds`);
  }
}

  // ADD these methods to your AudioManager class:

_getShuffledSoundWithProgressiveLoad(category, subcategory, country = null) {
  // Handle protest sounds with progressive loading
  if (category === "defense" && subcategory === "peopleSayNo" && country) {
    const countrySaysNo = country.endsWith("SaysNo") ? country : country + "SaysNo";
    
    this._checkAndLoadMoreProtestSounds(countrySaysNo);
    
    // Get the sound using existing shuffle logic
    return this._getShuffledSound(category, subcategory, country);
  }
  
  // For non-protest sounds, use existing method
  return this._getShuffledSound(category, subcategory, country);
}

_checkAndLoadMoreProtestSounds(countrySaysNo) {
  const trackingData = this.progressiveLoading.peopleSayNo[countrySaysNo];
  const config = this.progressiveLoading.config;
  
  if (!trackingData) return;

  const totalAvailable = this.soundFiles.defense?.peopleSayNo?.[countrySaysNo]?.length || 0;
  const currentlyLoaded = trackingData.loaded;
  const currentlyLoading = trackingData.loading;
  const maxToLoad = Math.min(config.maxLoadCount, totalAvailable);
  
  // Check if we have enough sounds loaded
  const loadedSounds = this.sounds.defense?.peopleSayNo?.[countrySaysNo] || [];
  const usableSounds = loadedSounds.filter(sound => sound !== null && sound !== undefined);
  
  // Skip if already loading or enough loaded
  if (currentlyLoading > 0 || 
      usableSounds.length > config.loadTriggerThreshold || 
      currentlyLoaded >= maxToLoad) {
    return;
  }
  
  // Respect loading delays on slow connections
  const timeSinceLastLoad = Date.now() - this.progressiveLoading.lastLoadTime;
  if (timeSinceLastLoad < config.loadDelay) {
    // Schedule for later
    setTimeout(() => {
      this._checkAndLoadMoreProtestSounds(countrySaysNo);
    }, config.loadDelay - timeSinceLastLoad);
    return;
  }
  
  console.log(`[AUDIO] Loading more ${countrySaysNo} sounds (${this.networkInfo.connectionQuality} connection)`);
  
  // Load the next batch
  const nextLoadCount = Math.min(
    config.progressiveLoadCount,
    maxToLoad - currentlyLoaded
  );
  
  this._loadNextProtestSoundsWithRetry(countrySaysNo, nextLoadCount);
}

_loadNextProtestSoundsWithRetry(countrySaysNo, count) {
  const trackingData = this.progressiveLoading.peopleSayNo[countrySaysNo];
  const config = this.progressiveLoading.config;
  const availableSounds = this.soundFiles.defense?.peopleSayNo?.[countrySaysNo];
  
  if (!availableSounds || !trackingData) return;

  // Ensure destination array exists
  if (!this.sounds.defense.peopleSayNo) {
    this.sounds.defense.peopleSayNo = {};
  }
  if (!this.sounds.defense.peopleSayNo[countrySaysNo]) {
    this.sounds.defense.peopleSayNo[countrySaysNo] = [];
  }

  const startIndex = trackingData.loaded;
  const endIndex = Math.min(startIndex + count, availableSounds.length);
  
  this.progressiveLoading.lastLoadTime = Date.now();

  // Load sounds with network-appropriate delays
  for (let i = startIndex; i < endIndex; i++) {
    const loadDelay = (i - startIndex) * (this.networkInfo.isSlowConnection ? 500 : 200);
    
    setTimeout(() => {
      this._loadSingleSoundWithRetry(countrySaysNo, i, availableSounds[i], 0);
    }, loadDelay);
  }
}

/**
 * Load a single sound with retry logic
 */
_loadSingleSoundWithRetry(countrySaysNo, index, soundPath, retryCount = 0) {
  const trackingData = this.progressiveLoading.peopleSayNo[countrySaysNo];
  const config = this.progressiveLoading.config;
  
  // Mark as loading
  trackingData.loading++;
  
  const audio = new Audio(this.resolvePath(soundPath));
  audio.preload = "auto";
  
  // Set timeout for slow connections
  const loadTimeout = setTimeout(() => {
    console.warn(`[AUDIO] Load timeout for ${countrySaysNo} sound ${index}`);
    audio.src = ''; // Cancel loading
    this._handleLoadFailure(countrySaysNo, index, soundPath, retryCount);
  }, this.networkInfo.isSlowConnection ? 15000 : 8000);

  audio.oncanplaythrough = () => {
    clearTimeout(loadTimeout);
    
    this.sounds.defense.peopleSayNo[countrySaysNo][index] = audio;
    this.loadedSounds.add(`defense.peopleSayNo.${countrySaysNo}.${index}`);
    
    trackingData.loaded++;
    trackingData.loading--;
    
    console.log(`[AUDIO] ✓ Loaded ${countrySaysNo} sound ${index + 1}/${this.soundFiles.defense.peopleSayNo[countrySaysNo].length}`);
  };

  audio.onerror = () => {
    clearTimeout(loadTimeout);
    this._handleLoadFailure(countrySaysNo, index, soundPath, retryCount);
  };

  // Start loading
  audio.load();
}

/**
 * Handle loading failures with retry logic
 */
_handleLoadFailure(countrySaysNo, index, soundPath, retryCount) {
  const trackingData = this.progressiveLoading.peopleSayNo[countrySaysNo];
  const config = this.progressiveLoading.config;
  
  trackingData.loading--;
  trackingData.failed++;
  
  if (retryCount < config.maxRetries) {
    console.log(`[AUDIO] Retrying ${countrySaysNo} sound ${index} (attempt ${retryCount + 1}/${config.maxRetries})`);
    
    setTimeout(() => {
      this._loadSingleSoundWithRetry(countrySaysNo, index, soundPath, retryCount + 1);
    }, config.retryDelay);
  } else {
    console.warn(`[AUDIO] Failed to load ${countrySaysNo} sound ${index} after ${config.maxRetries} attempts`);
  }
}

}

// Make it globally available
window.AudioManager = AudioManager;
