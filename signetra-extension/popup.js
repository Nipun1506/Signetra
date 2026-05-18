document.addEventListener('DOMContentLoaded', () => {
  const zoomToggle  = document.getElementById('zoom-toggle');
  const meetToggle  = document.getElementById('meet-toggle');
  const teamsToggle = document.getElementById('teams-toggle');
  const statusDot   = document.getElementById('status-dot');
  const statusText  = document.getElementById('status-text');

  // Load initial toggle states
  chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
    if (response) {
      zoomToggle.checked  = response.zoom_enabled  !== false;
      meetToggle.checked  = response.meet_enabled  !== false;
      teamsToggle.checked = response.teams_enabled !== false;
    }
  });

  // Handle toggles
  zoomToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_PLATFORM', platform: 'zoom_enabled',  enabled: e.target.checked });
  });
  meetToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_PLATFORM', platform: 'meet_enabled',  enabled: e.target.checked });
  });
  teamsToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_PLATFORM', platform: 'teams_enabled', enabled: e.target.checked });
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
      } else { throw new Error(); }
    } catch {
      statusDot.className = 'dot red';
      statusText.textContent = 'SIGNETRA not running';
      statusText.style.color = '#ef4444';
    }
  }

  checkHealth();
  setInterval(checkHealth, 5000);
});
