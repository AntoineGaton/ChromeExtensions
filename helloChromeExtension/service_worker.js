// Ensure service worker activates properly
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Check if the URL is a chrome:// URL
  try {
    // Inject the content script into the current tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log("Hello from the content script!");
      },
    });
  } catch (error) {
    console.error("Error checking URL:", error);
  }
});

