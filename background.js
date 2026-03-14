// TimeCalc background service worker
// Listens for messages from popup.js to update the toolbar badge

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.type === 'SET_BADGE') {
    const text  = msg.text  || '';
    const color = msg.color || '#3b9efa';
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }
  if (msg.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' });
  }
});

// Clear badge when extension is installed / updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
