// Listen for messages from the Vercel web app
window.addEventListener("message", (event) => {
  // We only accept messages from our own window
  if (event.source !== window) return;

  if (event.data && event.data.type === 'SIGNETRA_GESTURE') {
    // Forward the gesture to the Chrome Extension background script
    chrome.runtime.sendMessage(event.data);
  }
});
