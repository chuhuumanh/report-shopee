const axios = require('axios');
const SERVER_ENDPOINT = `http://103.162.21.218:5997`;
async function getCookiesShopee() {
  return new Promise((resolve, reject) => {
    let cookiesString = '';
    chrome.cookies.getAll({ domain: '.shopee.vn' }, (cookies) => {
      const listKeys = ['SPC_ST', 'SPC_SC_SESSION', 'SPC_CDS'];
      for (const cookie of cookies) {
        if (listKeys.includes(cookie.name)) {
          cookiesString += `${cookie.name}=${cookie.value};`;
        }
      }
      resolve(cookiesString);
    });
  });
}

async function sendRequestForServer(payload) {
  const res = await axios.post(`${SERVER_ENDPOINT}/export`, payload);
  return res.data;
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'EXPORT_REPORT') {
    const cookiesString = await getCookiesShopee();
    if (!cookiesString) return sendResponse({ isSuccess: false });

    const resExport = await sendRequestForServer({
      startDate: message.data.startDate,
      endDate: message.data.endDate,
      cookiesString: cookiesString,
    });

    chrome.storage.local.get(['jobIds'], (result) => {
      let jobIds = result.jobIds || []; // Nếu chưa có thì khởi tạo là mảng rỗng
      jobIds.push(resExport.jobId); // Thêm jobId mới vào mảng
      chrome.storage.local.set({ jobIds: jobIds }, () => {
        console.log('Updated jobIds:', jobIds);
      });
    });
  }

  if (message.type === 'ADD_JOB') {
    chrome.storage.local.get(['jobIds'], (result) => {
      let jobIds = result.jobIds || [];
      jobIds.push(message.data.jobId);
      chrome.storage.local.set({ jobIds: jobIds }, () => {
        console.log('Updated jobIds:', jobIds);
      });
    });
  }
  if (message.type === 'FETCH_COOKIES') {
    const cookiesString = await getCookiesShopee();
    console.log(cookiesString, 'cookiesString');
    sendResponse({ cookies: cookiesString });
  }
  return true;
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
