const { reportXLSX, reportWalletXLSX } = require('./modules/request');
const {
  requestOrderReport,
  getReportById,
  exportWalletTransaction,
  getWalletReportById,
} = require('./modules/shopee');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPORT_REPORT') {
    setTimeout(() => {
      console.log('--- START REPORT ---');
      handleExportReport(message.data);
    }, 5000);
  }
});

async function getOrdersByRange(startDate, endDate) {
  // const resOrderReport = await requestOrderReport(startDate, endDate);
  // const orderReport = resOrderReport.data;
  const orderReport = {}
  const reportId = orderReport.report_id || 20998824;
  if (reportId) {
    const limit = 3;
    let retry = 0;
    let isReportSuccess = false;
    while (!isReportSuccess && retry < limit) {
      try {
        const resReport = await getReportById(reportId);
        const dataReport = resReport.data;
        if (dataReport && dataReport.status > 1) {
          isReportSuccess = true;
        }

        retry += 1;
      } catch (error) {
        retry += 1;
      }
    }

    if (isReportSuccess) {
      const ordersReport = await reportXLSX(reportId);
      return ordersReport;
    }
  }
  return [];
}

async function getOrdersWalletByRange(startDate, endDate) {
  // const resWalletReport = await exportWalletTransaction({
  //   wallet_provider: 0,
  //   start_date: startDate,
  //   end_date: endDate,
  //   transaction_types: [
  //     101, 401, 404, 406, 412, 415, 461, 413, 418, 462, 465, 468, 471, 472, 301,
  //     505, 504, 302, 451, 303, 802,
  //   ],
  // });
  // const walletReport = resWalletReport.data.wallet_transaction_report;
  const walletReport = {}
  const reportId = walletReport.report_id || 4153877;
  console.log(reportId, 'reportId')

  if (reportId) {
    const limit = 3;
    let retry = 0;
    let isReportSuccess = false;
    while (!isReportSuccess && retry < limit) {
      try {
        const resReport = await getWalletReportById(reportId);
        console.log(resReport, 'resReport')
        const dataReport = resReport.data.wallet_transaction_report;
        if (dataReport && dataReport.status > 1) {
          isReportSuccess = true;
        }
        retry += 1;
      } catch (error) {
        console.log(error)
        retry += 1;
      }
    }

    if (isReportSuccess) {
      const dataReport = await reportWalletXLSX(reportId);
      return dataReport;
    }
  }
  return [];
}

async function handleExportReport({ startDate, endDate }) {
  const orders = await getOrdersByRange(startDate, endDate);
  console.log(orders, 'orders')
  const ordersWallet = await getOrdersWalletByRange(startDate, endDate);
  console.log(ordersWallet, 'ordersWallet')
}
