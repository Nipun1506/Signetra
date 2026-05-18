// Initialize storage defaults for all three supported platforms
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SIGNETRA-BG] Extension installed/updated. Initializing storage defaults.');
  chrome.storage.sync.get(['zoom_enabled', 'meet_enabled', 'teams_enabled'], (result) => {
    const initData = {};
    if (result.zoom_enabled  === undefined) initData.zoom_enabled  = true;
    if (result.meet_enabled  === undefined) initData.meet_enabled  = true;
    if (result.teams_enabled === undefined) initData.teams_enabled = true;

    if (Object.keys(initData).length > 0) {
      chrome.storage.sync.set(initData, () => {
        console.log('[SIGNETRA-BG] Storage defaults set:', initData);
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Popup: get current enabled state for all platforms
  if (request.action === 'GET_STATUS') {
    chrome.storage.sync.get(['zoom_enabled', 'meet_enabled', 'teams_enabled'], (result) => {
      sendResponse(result);
    });
    return true;
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
    console.log('[SIGNETRA-BG] Received gesture:', request.phrase, '— routing to video call tabs');

    chrome.tabs.query({
      url: [
        "*://app.zoom.us/*",
        "*://*.zoom.us/*",
        "*://meet.google.com/*",
        "*://teams.microsoft.com/*",
        "*://teams.live.com/*"
      ]
    }, (tabs) => {
      console.log('[SIGNETRA-BG] Found', tabs.length, 'matching video call tab(s)');

      if (tabs.length === 0) {
        console.warn('[SIGNETRA-BG] No Zoom/Meet/Teams tabs found. Open a video call in Chrome first.');
      }

      tabs.forEach(tab => {
        console.log('[SIGNETRA-BG] Sending to tab', tab.id, ':', tab.url);
        chrome.tabs.sendMessage(tab.id, request, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[SIGNETRA-BG] Failed to send to tab', tab.id, ':', chrome.runtime.lastError.message);
          } else {
            console.log('[SIGNETRA-BG] Successfully sent to tab', tab.id);
          }
        });
      });
    });

    sendResponse({ received: true });
    return true;
  }
});

console.log('[SIGNETRA-BG] Background service worker started.');
