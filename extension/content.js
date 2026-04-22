let hideTimer = null;

const overlay = document.createElement("div");
overlay.id = "signetra-overlay";
overlay.style.position = "fixed";
overlay.style.bottom = "60px";
overlay.style.left = "50%";
overlay.style.transform = "translateX(-50%)";
overlay.style.background = "rgba(0,0,0,0.82)";
overlay.style.color = "white";
overlay.style.fontSize = "22px";
overlay.style.fontFamily = "Inter, sans-serif";
overlay.style.padding = "12px 32px";
overlay.style.borderRadius = "14px";
overlay.style.zIndex = "99999";
overlay.style.display = "none";
overlay.style.opacity = "0";
overlay.style.transition = "opacity 0.3s ease";
overlay.style.border = "1px solid rgba(59,130,246,0.5)";
document.body.appendChild(overlay);

let ws = null;

function connectWebsocket() {
  chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled === false) return; // Opted out by default or disabled
    
    ws = new WebSocket("ws://localhost:8000/ws/detection");
    
    ws.onopen = () => {
      console.log("SIGNETRA: Connected to local detection server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.phrase && data.confidence) {
        overlay.textContent = `${data.phrase} • ${data.confidence}%`;
        overlay.style.display = "block";
        requestAnimationFrame(() => {
          overlay.style.opacity = "1";
        });
        
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.style.display = "none";
          }, 300);
        }, 4000);
      }
    };

    ws.onclose = () => {
      console.log("SIGNETRA: Disconnected from local server. Reconnecting in 3s...");
      setTimeout(connectWebsocket, 3000);
    };
    
    ws.onerror = (e) => {
      ws.close();
    };
  });
}

// Check if extension is enabled before connecting
chrome.storage.sync.get({ enabled: true }, (items) => {
  if (items.enabled) {
    connectWebsocket();
  }
});

// Listen for storage changes from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    if (changes.enabled.newValue) {
      connectWebsocket();
    } else if (ws) {
      ws.close();
      overlay.style.display = "none";
    }
  }
});
