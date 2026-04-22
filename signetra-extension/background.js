chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['zoom_enabled', 'whatsapp_enabled'], (result) => {
    const initData = {};
    if (result.zoom_enabled === undefined) initData.zoom_enabled = true;
    if (result.whatsapp_enabled === undefined) initData.whatsapp_enabled = true;
    
    if (Object.keys(initData).length > 0) {
      chrome.storage.sync.set(initData);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_STATUS') {
    chrome.storage.sync.get(['zoom_enabled', 'whatsapp_enabled'], (result) => {
      sendResponse(result);
    });
    return true; // keep channel open for async response
  }
  
  if (request.action === 'TOGGLE_PLATFORM') {
    const updates = {};
    updates[request.platform] = request.enabled;
    chrome.storage.sync.set(updates, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
