// Initialize storage defaults for all three supported platforms
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['zoom_enabled', 'meet_enabled', 'teams_enabled'], (result) => {
    const initData = {};
    if (result.zoom_enabled  === undefined) initData.zoom_enabled  = true;
    if (result.meet_enabled  === undefined) initData.meet_enabled  = true;
    if (result.teams_enabled === undefined) initData.teams_enabled = true;

    if (Object.keys(initData).length > 0) {
      chrome.storage.sync.set(initData);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Popup: get current enabled state for all platforms
  if (request.action === 'GET_STATUS') {
    chrome.storage.sync.get(['zoom_enabled', 'meet_enabled', 'teams_enabled'], (result) => {
      sendResponse(result);
    });
    return true; // keep message channel open for async response
  }

  // Popup: toggle a platform on/off
  if (request.action === 'TOGGLE_PLATFORM') {
    const updates = {};
    updates[request.platform] = request.enabled;
    chrome.storage.sync.set(updates, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Forward gesture from the Signetra recognition tab to all active video call tabs
  if (request.type === 'SIGNETRA_GESTURE') {
    chrome.tabs.query({
      url: [
        "*://app.zoom.us/*",
        "*://meet.google.com/*",
        "*://teams.microsoft.com/*",
        "*://teams.live.com/*"
      ]
    }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, request).catch(() => {
          // Tab may not have the content script — silently ignore
        });
      });
    });
  }
});
