/**
 * vercel_content.js
 * Runs on the Signetra tab (Vercel/localhost).
 * Listens for gesture detection events from the React app and forwards them
 * to the Chrome extension background script, which then routes them to
 * any open Zoom / Google Meet / Microsoft Teams tabs.
 */

console.log('[SIGNETRA-EXT] vercel_content.js loaded on:', window.location.href);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SIGNETRA_DETECTION' || data.type === 'SIGNETRA_GESTURE') {
    if (!data.phrase || data.phrase === 'UNKNOWN') return;

    console.log('[SIGNETRA-EXT] Gesture captured:', data.phrase, '— forwarding to background');

    try {
      chrome.runtime.sendMessage({
        type: 'SIGNETRA_GESTURE',
        phrase: data.phrase,
        category: data.category || 'General',
        confidence: data.confidence || null,
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[SIGNETRA-EXT] Error sending to background:', chrome.runtime.lastError.message);
        } else {
          console.log('[SIGNETRA-EXT] Message sent to background OK');
        }
      });
    } catch (err) {
      console.error('[SIGNETRA-EXT] Failed to send message:', err);
    }
  }
});
