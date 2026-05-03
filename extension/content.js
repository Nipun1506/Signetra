// Create the subtitle overlay
const overlay = document.createElement("div");
overlay.id = "signetra-overlay";
overlay.style.cssText = `
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.82);
  color: white;
  font-size: 22px;
  font-family: Inter, sans-serif;
  padding: 12px 32px;
  border-radius: 14px;
  z-index: 99999;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  border: 1px solid rgba(59,130,246,0.5);
  pointer-events: none;
`;
document.body.appendChild(overlay);

let hideTimer = null;

function showSubtitle(phrase, confidence) {
  overlay.textContent = `${phrase} • ${Math.round(confidence)}%`;
  overlay.style.display = "block";
  requestAnimationFrame(() => { overlay.style.opacity = "1"; });
  
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 300);
  }, 4000);
}

// Listen for messages from the Signetra web app tab
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SIGNETRA_DETECTION") {
    chrome.storage.sync.get({ enabled: true }, (items) => {
      if (items.enabled) showSubtitle(message.phrase, message.confidence);
    });
  }
});

console.log("SIGNETRA: Subtitle overlay ready on", window.location.hostname);
