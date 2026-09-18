class GlowOutline {
  constructor() {
    this.initializeGlobalStyles();
  }

  initializeGlobalStyles() {
    if (!document.getElementById("glow-outline-style")) {
      const styleElement = document.createElement("style");
      styleElement.id = "glow-outline-style";
      styleElement.textContent = `
              @keyframes outlinePulse {
                  0% { transform: scale(1.0); }
                  50% { transform: scale(1.1); }
                  100% { transform: scale(1.0); }
              }
              
              @keyframes cartoonGlowPulse {
                  0% { 
                      box-shadow: 
                          0 0 0 4px var(--glow-color, rgba(0, 255, 13, 1)),
                          0 0 0 8px var(--glow-color, rgba(0, 255, 34, 0.4));
                  }
                  50% { 
                      box-shadow: 
                          0 0 0 6px var(--glow-color, rgba(0, 255, 26, 1)),
                          0 0 0 12px var(--glow-color, rgba(0, 255, 51, 0.4));
                  }
                  100% { 
                      box-shadow: 
                          0 0 0 4px var(--glow-color, rgba(17, 255, 0, 1)),
                          0 0 0 8px var(--glow-color, rgba(56, 133, 57, 0.4));
                  }
              }

              .record-button-glow {
                  position: relative;
                  z-index: 1;
              }

              .record-button-glow::before {
                  content: '';
                  position: absolute;
                  top: -8px;
                  left: -8px;
                  right: -8px;
                  bottom: -8px;
                  border-radius: 50%;
                  background: transparent;
                  z-index: -1;
                  animation: cartoonGlowPulse 2s infinite ease-in-out;
                  pointer-events: none;
              }

              .record-button-glow.recording::before {
                  --glow-color: rgba(231, 76, 60, .9);
              }

              .record-button-glow.waiting::before {
                  --glow-color: rgba(243, 156, 18, .9);
              }
          `;
      document.head.appendChild(styleElement);
    }
  }

  create({
    parentId,
    position = { left: 0, top: 0 },
    size = { width: 100, height: 100 },
    color = "#FFD700",
    borderWidth = 4,
    zIndex = "10210",
    borderRadius = "50%",
  }) {
    const wrapper = document.createElement("div");
    wrapper.id = `${parentId}-protestors-wrapper`;
    Object.assign(wrapper.style, {
      position: "absolute",
      left: `${position.left}px`,
      top: `${position.top}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      pointerEvents: "none", // Keep this as none
      cursor: "pointer",
      zIndex: zIndex.toString(),
      transformOrigin: "bottom center",
    });

    const outlineContainer = document.createElement("div");
    outlineContainer.id = `${parentId}-protestors-outline`;
    Object.assign(outlineContainer.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      borderRadius: borderRadius,
      border: `${borderWidth}px dashed ${color}`,
      boxShadow: `0 0 15px 5px ${this.getRGBAFromColor(color, 0.7)}`,
      opacity: "0",
      animation: window.DEBUG_DISABLE?.glowPulse ? "none" : "outlinePulse 1.5s infinite ease-in-out",
      pointerEvents: "none",
      zIndex: "1",
      transition: "opacity 0.3s ease-out, box-shadow 0.2s ease",
      willChange: "transform",
    });

    const onMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        outlineContainer.style.boxShadow = `0 0 20px 10px #ff8800`;
      }
    };

    const onMouseOut = () => {
      outlineContainer.style.boxShadow = `0 0 15px 5px ${this.getRGBAFromColor(color, 0.7)}`;
    };

    // Attach listeners to wrapper, not document
    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("mouseleave", onMouseOut);

    // Store the listener references for cleanup
    wrapper._glowListeners = {
      mousemove: onMouseMove,
      mouseleave: onMouseOut,
    };

    wrapper.appendChild(outlineContainer);
    return wrapper;
  }

  // Adds glow to record button
  addToRecordButton(buttonElement) {
    // Add glow class to record button
    buttonElement.classList.add("record-button-glow");

    // Return the button element for chaining
    return buttonElement;
  }

  // Updates glow color from button state
  updateGlowColor(buttonElement, color) {
    if (buttonElement && buttonElement.style) {
      // Extract RGB values from color
      let rgba = color;
      if (color.startsWith("#")) {
        rgba = this.getRGBAFromColor(color, 0.5);
      }

      buttonElement.style.setProperty("--glow-color", rgba);
    }
  }

  getRGBAFromColor(color, alpha) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
