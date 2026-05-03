chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true });
});

// Listen for detection events from the Signetra app tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SIGNETRA_DETECTION") {
    // Forward to all Zoom/WhatsApp tabs
    chrome.tabs.query({ 
      url: ["https://app.zoom.us/*", "https://web.whatsapp.com/*"] 
    }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  }
});
