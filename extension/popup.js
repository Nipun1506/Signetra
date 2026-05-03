const toggle = document.getElementById("toggleEnabled");
const dot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

chrome.storage.sync.get({ enabled: true }, (items) => {
  toggle.checked = items.enabled;
  updateDot(items.enabled);
});

toggle.addEventListener("change", (e) => {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ enabled });
  updateDot(enabled);
});

function updateDot(enabled) {
  if (enabled) {
    dot.style.background = '#22C55E';
    dot.style.boxShadow = '0 0 8px #22C55E';
    statusText.textContent = 'Working';
  } else {
    dot.style.background = '#EF4444';
    dot.style.boxShadow = '0 0 8px #EF4444';
    statusText.textContent = 'Disabled';
  }
}
