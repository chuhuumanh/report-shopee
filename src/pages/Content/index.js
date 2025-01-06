const axios = require('axios');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPORT_REPORT') {
    handleExp;
  }
});
