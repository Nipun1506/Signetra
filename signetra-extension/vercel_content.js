/**
 * vercel_content.js
 * Runs on the Signetra tab (Vercel/localhost).
 * Listens for gesture detection events from the React app and forwards them
 * to the Chrome extension background script, which then routes them to
 * any open Zoom / Google Meet / Microsoft Teams tabs.
 *
 * NOTE: Recognize.tsx emits type: 'SIGNETRA_DETECTION' — this script
 * normalizes it to 'SIGNETRA_GESTURE' for the extension routing pipeline.
 */
window.addEventListener("message", (event) => {
  // Only accept messages from this same window (not iframes or other origins)
  if (event.source !== window) return;

  const data = event.data;
  if (!data) return;

  // Handle both event types:
  //   'SIGNETRA_DETECTION' → fired by Recognize.tsx on each gesture
  //   'SIGNETRA_GESTURE'   → normalized form used by the extension internally
  if (data.type === 'SIGNETRA_DETECTION' || data.type === 'SIGNETRA_GESTURE') {
    if (!data.phrase || data.phrase === 'UNKNOWN') return; // skip unrecognized frames

    chrome.runtime.sendMessage({
      type: 'SIGNETRA_GESTURE',
      phrase: data.phrase,
      category: data.category || 'General',
      confidence: data.confidence || null,
    });
  }
});
