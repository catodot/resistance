
function initializeSocialSharing() {
  const recordVoiceBtn = document.getElementById("share-button");
  const shareGameBtn = document.getElementById("native-share-button");

  if (recordVoiceBtn) {
    recordVoiceBtn.addEventListener("click", () => {
      const action = recordVoiceBtn.getAttribute("data-action");

      if (action === "record-voice") {
        openVoiceRecordingInterface();
      } else if (action === "external-link") {
        const link = recordVoiceBtn.getAttribute("data-link");
        if (link) {
          window.open(link, "_blank");
        }
      }
    });
  }

  if (shareGameBtn) {
    shareGameBtn.addEventListener("click", shareGame);
  }

  function getShareText() {
    const score = document.getElementById("final-score")?.textContent || "0";
    const blocksText = document.getElementById("blocks-stat")?.textContent || "0 attacks";
    const timeText = document.getElementById("time-stat")?.textContent || "0 months";

    return `I scored ${score} points in WHACK-A--HOLE! Blocked ${blocksText} and survived for ${timeText}. Join the resistance!`;
  }

  function shareGame() {
    const shareText = getShareText();
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "WHACK-A--HOLE Game",
          text: shareText,
          url: shareUrl,
        })
        .catch((err) => console.log("Share failed:", err));
      return;
    }

    navigator.clipboard
      .writeText(`${shareText} ${shareUrl}`)
      .then(() => {
        const originalText = shareGameBtn.textContent;
        shareGameBtn.textContent = "COPIED!";
        setTimeout(() => {
          shareGameBtn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => console.log("Could not copy text:", err));
  }
}

function openVoiceRecordingInterface() {
  const recorderModal = document.getElementById("voice-recorder-modal");

  if (recorderModal) {
    // console.log("Showing voice recorder modal"); // Debug log

    // Explicitly remove hidden class and set display
    recorderModal.classList.remove("hidden");
    recorderModal.style.display = "flex";
    recorderModal.style.opacity = "1";
    recorderModal.style.visibility = "visible";

    // Create voice recorder if not exists
    if (!window.voiceRecorder) {
      window.voiceRecorder = new VoiceRecorder();

      // Pass modal ID; VoiceRecorder finds its elements
      window.voiceRecorder.init("voice-recorder-modal");
    }
  } else {
    console.error("Recorder modal not found!");
    // console.log("Recorder Modal:", recorderModal);
  }
}

function setupVoiceRecorderModal() {
  const closeBtn = document.getElementById("close-recorder");
  const recorderModal = document.getElementById("voice-recorder-modal");

  if (closeBtn && recorderModal) {
    closeBtn.addEventListener("click", () => {
      recorderModal.classList.add("hidden");
      recorderModal.style.display = "none";
      recorderModal.style.opacity = "0";
      recorderModal.style.visibility = "hidden";
    });
  } else {
    console.error("Close button or modal not found");
    // console.log("Close Button:", closeBtn);
    // console.log("Recorder Modal:", recorderModal);
  }
}

function initializeShareButtonsOnGameOver() {
  // console.log("Initializing share buttons"); // Debug log

  // Short timeout for game-over elements to render
  setTimeout(() => {
    initializeSocialSharing();
  }, 100);
}

// Set up voice recorder modal on DOMContentLoaded
document.addEventListener("DOMContentLoaded", setupVoiceRecorderModal);
