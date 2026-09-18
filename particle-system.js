
class ParticleSystem {
  constructor(zIndexes) {
    this.Z_INDEXES = zIndexes || {
      CONFETTI: 505,
      FIREWORKS: 510,
    };
    this.activeParticles = [];
    this.isMobile = this._isMobile();
  }

  _randomBlobRadius() {
    const blobs = [
      "20% 80% 70% 30% / 60% 20% 80% 40%",
      "80% 20% 30% 70% / 20% 70% 30% 80%",
      "85% 15% 50% 50% / 40% 60% 40% 60%",
      "10% 90% 60% 40% / 70% 30% 65% 35%",
      "50% 50% 15% 85% / 85% 15% 50% 50%",
    ];
    return blobs[Math.floor(Math.random() * blobs.length)];
  }

  /**
   * Determine if the device is mobile
   * @private
   * @returns {boolean} - True if mobile device detected
   */
  _isMobile() {
    return window.DeviceUtils && window.DeviceUtils.isMobile();
  }

  /**
   * Create a particle burst effect
   * @param {Object} options - Burst configuration options
   */
  createBurst(options) {
    const {
      type, // 'confetti' or 'firework'
      position, // {x, y, width, height}
      container, // DOM container to append particles to
      count, // Number of particles to create
      mobileCount = null, // Optional override for particle count on mobile
    } = options;

    if (!container) return;
    if (!position) return;

    // Determine particle count based on device
    const particleCount = this.isMobile && mobileCount !== null ? mobileCount : count;

    // Calculate spawn points
    const spawnPoints = this._calculateSpawnPoints(position);

    // Stagger particle creation
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        // Choose a random spawn point
        const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

        // Add variation to position
        const spreadFactor = this.isMobile ? 70 : 50;
        const startX = point.x + (Math.random() * spreadFactor - spreadFactor / 2);
        const startY = point.y + (Math.random() * spreadFactor - spreadFactor / 2);

        // Create the appropriate particle
        if (type === "confetti") {
          this._createConfettiParticle(startX, startY, container, i % 2 === 0);
        } else if (type === "firework") {
          this._createFireworkParticle(startX, startY, container);
        }
      }, i * (this.isMobile ? 30 : 15)); // Slower spawn rate on mobile
    }
  }

  /**
   * Calculate spawn points based on container position
   * @private
   * @param {Object} position - Position data {x, y, width, height}
   * @returns {Array} - Array of spawn points
   */
  _calculateSpawnPoints(position) {
    const { left, top, width, height } = position;

    return [
      { x: left + width * 0.2, y: top + height * 0.3 },
      { x: left + width * 0.5, y: top + height * 0.5 },
      { x: left + width * 0.8, y: top + height * 0.4 },
    ];
  }

  /**
   * Create a confetti particle
   * @private
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {HTMLElement} container - Container element
   * @param {boolean} isLarger - Whether this should be a larger particle
   */
  _createConfettiParticle(startX, startY, container, isLarger = false) {
    if (!container) return;


    // Create the particle element
    const particle = document.createElement("div");
    particle.className = "freedom-confetti";

    // Performance optimization
    particle.style.willChange = "transform, opacity";

    particle.style.borderRadius = this._randomBlobRadius();

    const shouldBeLarger = this.isMobile ? Math.random() > 0.5 : isLarger;
    const baseSize = this.isMobile ? 12 : 9;
    const variance = this.isMobile ? 8 : 7;
    const size = shouldBeLarger ? baseSize + Math.random() * variance * 1.5 : baseSize + Math.random() * variance;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Poster-paint tone to match illustrated palette
    const hue = Math.floor(Math.random() * 360);
    const lightness = 45 + Math.random() * 20;
    particle.style.backgroundColor = `hsl(${hue}, 75%, ${lightness}%)`;
    particle.style.border = this.isMobile ? "2px solid #000" : "3px solid #000";

    // Position the particle
    particle.style.position = "absolute";
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.zIndex = this.Z_INDEXES.CONFETTI;

    // Add to container
    container.appendChild(particle);

    // Set up animation parameters
    const angle = Math.random() * Math.PI * 2;
    const distance = this.isMobile ? 60 + Math.random() * 140 : 40 + Math.random() * 120;

    const destinationX = startX + Math.cos(angle) * distance;
    const destinationY = startY + Math.sin(angle) * distance;
    const duration = 700 + Math.random() * 900;

    // Control points for bezier curve
    const cp1x = startX + (destinationX - startX) * 0.3 + (Math.random() * 30 - 15);
    const cp1y = startY + (destinationY - startY) * 0.3 - Math.random() * 20;
    const cp2x = startX + (destinationX - startX) * 0.6 + (Math.random() * 30 - 15);
    const cp2y = destinationY - Math.random() * 50;

    // Initial rotation
    const rotation = Math.random() * 360;
    particle.style.transform = `rotate(${rotation}deg)`;

    // Create particle data
    const particleData = {
      type: "confetti",
      element: particle,
      startTime: performance.now(),
      animationCompleted: false,
      paused: false,
      startX,
      startY,
      destinationX,
      destinationY,
      rotation,
      duration,
      cp1x,
      cp1y,
      cp2x,
      cp2y,
      simplifiedPath: this.isMobile,
    };

    // Add to active particles
    this.activeParticles.push(particleData);

    // Start the animation
    this._animateParticle(particleData);
  }

  /**
   * Create a firework particle
   * @private
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {HTMLElement} container - Container element
   */
  _createFireworkParticle(startX, startY, container) {
    if (!container) return;


    // Create the particle element
    const particle = document.createElement("div");
    particle.className = "freedom-firework";
    particle.style.willChange = "transform, opacity";

    // Choose particle type based on device
    const particleTypes = this.isMobile ? ["circle", "circle", "spark"] : ["spark", "circle", "spark"];
    const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];

    // Random vibrant color
    const hue = Math.floor(Math.random() * 360);

    // Muted poster-paint tone, matches confetti style
    if (particleType === "circle") {
      particle.style.backgroundColor = `hsl(${hue}, 75%, 55%)`;
      particle.style.borderRadius = this._randomBlobRadius();
    } else if (particleType === "spark") {
      const sparkAngle = Math.random() * 360;
      particle.style.backgroundColor = `hsl(${hue}, 75%, 58%)`;
      particle.style.borderRadius = "40% 40% 5% 5%";
      particle.style.transform = `rotate(${sparkAngle}deg)`;
    }

    // Thicker border for clear ink outline
    particle.style.border = this.isMobile ? "2px solid #000" : "3px solid #000";

    // Size based on device and type
    const sizeFactor = this.isMobile ? 1.3 : 1.0;
    const size = particleType === "spark" ? (6 + Math.random() * 12) * sizeFactor : (10 + Math.random() * 15) * sizeFactor;

    particle.style.width = `${size}px`;
    if (particleType === "spark") {
      const elongation = this.isMobile ? 2.5 + Math.random() : 3 + Math.random();
      particle.style.height = `${size * elongation}px`;
    } else {
      particle.style.height = `${size}px`;
    }

    // Position the particle
    particle.style.position = "absolute";
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.zIndex = this.Z_INDEXES.FIREWORKS;

    // Add to container
    container.appendChild(particle);

    // Set up animation parameters
    const angle = Math.random() * Math.PI * 2;
    const distance = this.isMobile ? 60 + Math.random() * 100 : 80 + Math.random() * 180;

    const destinationX = startX + Math.cos(angle) * distance;
    const destinationY = startY + Math.sin(angle) * distance;

    // Duration based on device
    const duration = this.isMobile ? 600 + Math.random() * 300 : 800 + Math.random() * 500;

    // Create particle data
    const particleData = {
      type: "firework",
      element: particle,
      startTime: performance.now(),
      animationCompleted: false,
      paused: false,
      startX,
      startY,
      destinationX,
      destinationY,
      duration,
      particleType,
      centerX: startX,
      centerY: startY,
    };

    // Add to active particles
    this.activeParticles.push(particleData);

    // Start the animation
    this._animateParticle(particleData);
  }

  /**
   * Unified animation function for all particles
   * @private
   * @param {Object} particleData - Particle data
   */
  _animateParticle(particleData) {
    if (particleData.paused || particleData.animationCompleted) return;

    const element = particleData.element;
    if (!element || !element.parentNode) {
      particleData.animationCompleted = true;
      this._removeParticle(particleData);
      return;
    }

    const animateFrame = (timestamp) => {
      if (particleData.paused || particleData.animationCompleted) return;

      const elapsed = timestamp - particleData.startTime;
      const progress = Math.min(elapsed / particleData.duration, 1);

      if (progress < 1) {
        // Handle animation based on particle type
        if (particleData.type === "confetti") {
          this._updateConfettiParticle(particleData, progress);
        } else if (particleData.type === "firework") {
          this._updateFireworkParticle(particleData, progress);
        }

        // Optimize frame rate on mobile
        if (this.isMobile && Math.random() > 0.7) {
          setTimeout(() => requestAnimationFrame(animateFrame), 32);
        } else {
          requestAnimationFrame(animateFrame);
        }
      } else {
        // Animation complete, remove particle
        particleData.animationCompleted = true;
        this._removeParticle(particleData);
      }
    };

    requestAnimationFrame(animateFrame);
  }

  /**
   * Update confetti particle position and appearance
   * @private
   * @param {Object} particleData - Particle data
   * @param {number} progress - Animation progress (0-1)
   */
  _updateConfettiParticle(particleData, progress) {
    const element = particleData.element;

    let currentX, currentY;

    // Snaps out fast, then coasts, mimics burst
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    if (particleData.simplifiedPath) {
      // Linear path for mobile (more efficient)
      currentX = particleData.startX + (particleData.destinationX - particleData.startX) * easedProgress;
      currentY = particleData.startY + (particleData.destinationY - particleData.startY) * easedProgress;
    } else {
      const t = easedProgress;
      const t_ = 1 - t;

      currentX =
        Math.pow(t_, 3) * particleData.startX +
        3 * Math.pow(t_, 2) * t * particleData.cp1x +
        3 * t_ * Math.pow(t, 2) * particleData.cp2x +
        Math.pow(t, 3) * particleData.destinationX;

      currentY =
        Math.pow(t_, 3) * particleData.startY +
        3 * Math.pow(t_, 2) * t * particleData.cp1y +
        3 * t_ * Math.pow(t, 2) * particleData.cp2y +
        Math.pow(t, 3) * particleData.destinationY;
    }

    // transform avoids layout thrash from left/top
    const dx = currentX - particleData.startX;
    const dy = currentY - particleData.startY;

    // Simplified rotation on mobile
    if (particleData.simplifiedPath) {
      const spin = particleData.rotation + progress * 180 * (Math.random() > 0.5 ? 1 : -1);
      element.style.transform = `translate(${dx}px, ${dy}px) rotate(${spin}deg)`;
    } else {
      // Add spin animation
      const spin = particleData.rotation + progress * progress * 720 * (Math.random() > 0.5 ? 1 : -1);

      // Scale down at the end
      if (progress > 0.5) {
        const scale = 1 - ((progress - 0.5) / 0.5) * 0.7;
        element.style.transform = `translate(${dx}px, ${dy}px) rotate(${spin}deg) scale(${scale})`;
      } else {
        element.style.transform = `translate(${dx}px, ${dy}px) rotate(${spin}deg)`;
      }
    }
  }

  /**
   * Update firework particle position and appearance
   * @private
   * @param {Object} particleData - Particle data
   * @param {number} progress - Animation progress (0-1)
   */
  _updateFireworkParticle(particleData, progress) {
    const element = particleData.element;

    // Snaps out fast, then coasts, mimics burst
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentX = particleData.centerX + (particleData.destinationX - particleData.centerX) * easedProgress;

    // Arc effect - gentler on mobile
    const arcHeight = this.isMobile ? 30 : 60;
    const gravityStrength = this.isMobile ? 20 : 40;

    const verticalOffset = Math.sin(progress * Math.PI) * arcHeight;
    const gravity = Math.pow(progress, 2) * gravityStrength;
    const currentY = particleData.centerY + (particleData.destinationY - particleData.centerY) * easedProgress - verticalOffset + gravity;

    // transform avoids layout thrash from left/top
    const dx = currentX - particleData.centerX;
    const dy = currentY - particleData.centerY;

    // Rotation based on particle type
    if (particleData.particleType === "spark") {
      // Align spark's long axis to travel direction
      const travelAngle =
        Math.atan2(particleData.destinationY - particleData.centerY, particleData.destinationX - particleData.centerX) * (180 / Math.PI);
      const wobble = this.isMobile ? 2 : 5;
      const angle = travelAngle - 90 + Math.sin(progress * Math.PI * 2) * wobble;

      element.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
    } else {
      // Minimal rotation for circles
      const rotation = progress * 30 * (Math.random() > 0.5 ? 1 : -1);
      element.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
    }

    // Fade out near the end
    if (progress > 0.55) {
      const exitScale = 1 - (progress - 0.55) / 0.45;
      element.style.opacity = exitScale.toString();
    }
  }

  /**
   * @private
   * @param {Object} particleData - Particle data
   */
  _removeParticle(particleData) {
    // Remove from DOM
    if (particleData.element && particleData.element.parentNode) {
      particleData.element.parentNode.removeChild(particleData.element);
    }

    // Remove from active particles list
    const index = this.activeParticles.indexOf(particleData);
    if (index !== -1) {
      this.activeParticles.splice(index, 1);
    }
  }

  /**
   * Pause all active particles
   */
  pauseAll() {
    this.activeParticles.forEach((particle) => {
      particle.paused = true;
    });
  }

  /**
   * Resume all paused particles
   */
  resumeAll() {
    this.activeParticles.forEach((particle) => {
      if (particle.paused) {
        particle.paused = false;
        particle.startTime = performance.now() - particle.duration * (particle.lastProgress || 0);
        this._animateParticle(particle);
      }
    });
  }

  /**
   * Clean up all particles
   */
  cleanupAll() {
    // Copy array since we'll modify it
    const particles = [...this.activeParticles];

    particles.forEach((particle) => {
      particle.animationCompleted = true;
      if (particle.element && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });

    this.activeParticles = [];
  }
}
