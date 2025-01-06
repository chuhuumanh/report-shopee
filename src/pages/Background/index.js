chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPORT_REPORT') {
    handleReport(message);
  }
});

async function handleReport(task) {
  chrome.tabs.create({ url: task.url }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.sendMessage(tabId, task);
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
}
