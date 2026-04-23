document.addEventListener('DOMContentLoaded', () => {
  const zoomToggle = document.getElementById('zoom-toggle');
  const whatsappToggle = document.getElementById('whatsapp-toggle');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Load initial states
  chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
    if (response) {
      zoomToggle.checked = response.zoom_enabled !== false;
      whatsappToggle.checked = response.whatsapp_enabled !== false;
    }
  });

  // Handle toggles
  zoomToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({
      action: 'TOGGLE_PLATFORM',
      platform: 'zoom_enabled',
      enabled: e.target.checked
    });
  });

  whatsappToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({
      action: 'TOGGLE_PLATFORM',
      platform: 'whatsapp_enabled',
      enabled: e.target.checked
    });
  });

  // Health check polling
  async function checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch('https://signetra-production-95bb.up.railway.app/', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        statusDot.className = 'dot green';
        statusText.textContent = 'SIGNETRA is running';
        statusText.style.color = '#10b981';
      } else {
        throw new Error('Not OK');
      }
    } catch (e) {
      statusDot.className = 'dot red';
      statusText.textContent = 'SIGNETRA not running';
      statusText.style.color = '#ef4444';
    }
  }

  // Poll every 5s
  checkHealth();
  setInterval(checkHealth, 5000);
});
