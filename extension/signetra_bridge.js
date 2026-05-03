// Runs inside the Signetra app tab
// Bridges window.postMessage → chrome.runtime.sendMessage
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "SIGNETRA_DETECTION") {
    chrome.runtime.sendMessage(event.data);
  }
});
