let overlay = null;
let hideTimeout = null;
let isEnabled = true;

// Determine platform
const isZoom = window.location.hostname.includes('zoom.us');
const isWhatsApp = window.location.hostname.includes('whatsapp.com');
const platformKey = isZoom ? 'zoom_enabled' : 'whatsapp_enabled';

function initStorage() {
  chrome.storage.sync.get([platformKey], (result) => {
    isEnabled = result[platformKey] !== false;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[platformKey]) {
      isEnabled = changes[platformKey].newValue;
      if (!isEnabled) {
        hideOverlay();
      }
    }
  });
}

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'signetra-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '22px',
    padding: '12px 32px',
    borderRadius: '14px',
    background: 'rgba(0,0,0,0.82)',
    color: 'white',
    zIndex: '2147483647',
    border: '1px solid rgba(59,130,246,0.5)',
    transition: 'opacity 300ms ease-in-out',
    opacity: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    pointerEvents: 'none',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)'
  });
  document.body.appendChild(overlay);
}

function getCategoryColor(category) {
  category = (category || '').toLowerCase();
  if (category.includes('urgent')) return '#ef4444'; // red
  if (category.includes('greeting')) return '#3b82f6'; // blue
  if (category.includes('need')) return '#10b981'; // green
  return '#94a3b8'; // slate
}

function showOverlay(phrase, category, confidence) {
  createOverlay();
  
  if (hideTimeout) clearTimeout(hideTimeout);
  
  const color = getCategoryColor(category);
  const confBadge = confidence ? `<span style="font-size: 12px; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; margin-left: 8px;">${confidence}%</span>` : '';
  
  overlay.innerHTML = `
    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color}"></div>
    <span style="font-weight: 600; letter-spacing: 0.5px;">${phrase}</span>
    ${confBadge}
  `;
  
  // Reflow required for transition
  void overlay.offsetWidth;
  overlay.style.opacity = '1';
  
  hideTimeout = setTimeout(() => {
    hideOverlay();
  }, 4000);
}

function hideOverlay() {
  if (overlay) {
    overlay.style.opacity = '0';
  }
}

// Listen for gestures forwarded from the Vercel tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isEnabled) return;

  if (message.type === 'SIGNETRA_GESTURE') {
    if (message.phrase && message.phrase !== 'UNKNOWN') {
      showOverlay(message.phrase, message.category || 'General', message.confidence);
    }
  }
});

// Clean up
window.addEventListener('beforeunload', () => {
  if (hideTimeout) clearTimeout(hideTimeout);
});

// Start
initStorage();
console.log('SIGNETRA Cross-Tab Overlay Script Loaded');
