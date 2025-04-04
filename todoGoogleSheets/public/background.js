console.log("Background script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkIdentity") {
    if (chrome.identity) {
      sendResponse({ available: true });
    } else {
      sendResponse({ available: false });
    }
  }
  return true;
});
