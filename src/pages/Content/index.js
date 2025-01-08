const { reportXLSX, reportWalletXLSX } = require('./modules/request');
const {
  requestOrderReport,
  getReportById,
  exportWalletTransaction,
  getWalletReportById,
} = require('./modules/shopee');
const XLSX = require('xlsx');
const dayjs = require('dayjs');
const { showToast } = require('./modules/notification');

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPORT_REPORT') {
    showToast('Bắt đầu xử lý request sau 5s nữa !', 10000);
    setTimeout(() => {
      console.log('--- START REPORT ---');
      handleExportReport(message.data);
    }, 5000);
  }
});

async function getOrdersByRange(startDate, endDate) {
  const resOrderReport = await requestOrderReport(startDate, endDate);
  const orderReport = resOrderReport.data;
  const reportId = orderReport.report_id;

  if (reportId) {
    const limit = 5;
    let retry = 0;
    let isReportSuccess = false;
    while (!isReportSuccess && retry < limit) {
      try {
        const resReport = await getReportById(reportId);
        const dataReport = resReport.data;
        if (dataReport && dataReport.status > 1) {
          isReportSuccess = true;
        }
        await wait(2000);
      } catch (error) {
        console.log(error);
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
  const resWalletReport = await exportWalletTransaction({
    wallet_provider: 0,
    start_date: startDate,
    end_date: endDate,
    transaction_types: [
      101, 401, 404, 406, 412, 415, 461, 413, 418, 462, 465, 468, 471, 472, 301,
      505, 504, 302, 451, 303, 802,
    ],
  });
  const walletReport = resWalletReport.data.wallet_transaction_report;
  const reportId = walletReport.report_id;

  if (reportId) {
    const limit = 3;
    let retry = 0;
    let isReportSuccess = false;
    while (!isReportSuccess && retry < limit) {
      try {
        const resReport = await getWalletReportById(reportId);
        const dataReport = resReport.data.wallet_transaction_report;
        if (dataReport && dataReport.status > 1) {
          isReportSuccess = true;
        }
        await wait(2000);
      } catch (error) {
        console.log(error);
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

function generateTransactionObj(ordersWallet) {
  const obj = {};

  for (const order of ordersWallet) {
    const notIntransactionId = ['', 'Mã đơn hàng'];
    const isHaveTransactionId =
      order._2 !== null && !notIntransactionId.includes(order._2);
    if (isHaveTransactionId && order._2) {
      obj[order._2] = {
        datePaid: order['Báo cáo'],
        price: order._4,
      };
    }
  }

  return obj;
}

async function handleExportReport({ startDate, endDate }) {
  showToast(`Bắt đầu lấy dữ liệu orders from ${startDate} to ${endDate} !`);
  const orders = await getOrdersByRange(startDate, endDate);
  showToast(`Tổng số order lấy được là: ${orders.length}!`);
  console.log(orders, 'orders');

  showToast(
    `Hoàn thành lấy orders, tổng số order cần xử lý là: ${orders.length} !`
  );
  const dateNow = dayjs().format('YYYY-MM-DD');

  showToast(`Bắt đầu lấy dữ liệu wallet from ${startDate} to ${dateNow} !`);
  const ordersWallet = await getOrdersWalletByRange(startDate, dateNow);
  showToast(`Tổng số history wallet: ${ordersWallet.length} !`);

  showToast(`Bắt đầu xử lý dữ liệu`);
  const objTransaction = generateTransactionObj(ordersWallet);
  const ordersPaid = [];
  const orderNotPaid = [];

  for (const order of orders) {
    const transactionId = order['Mã đơn hàng'];

    const walletTransaction = objTransaction[transactionId];
    if (walletTransaction) {
      ordersPaid.push({
        ['Mã đơn hàng']: order['Mã đơn hàng'],
        ['Ngày đặt hàng']: order['Ngày đặt hàng'],
        ['Trạng Thái Đơn Hàng']: order['Trạng Thái Đơn Hàng'],
        ['Ngày thanh toán']: walletTransaction.datePaid,
      });
    } else {
      orderNotPaid.push({
        ['Mã đơn hàng']: order['Mã đơn hàng'],
        ['Ngày đặt hàng']: order['Ngày đặt hàng'],
        ['Trạng Thái Đơn Hàng']: order['Trạng Thái Đơn Hàng'],
      });
    }
  }

  // Tạo sheet từ dữ liệu ordersPaid và orderNotPaid
  const wb = XLSX.utils.book_new();

  // Sheet cho các đơn hàng đã thanh toán
  const wsPaid = XLSX.utils.json_to_sheet(ordersPaid);
  XLSX.utils.book_append_sheet(wb, wsPaid, 'Orders Paid');

  // Sheet cho các đơn hàng chưa thanh toán
  const wsNotPaid = XLSX.utils.json_to_sheet(orderNotPaid);
  XLSX.utils.book_append_sheet(wb, wsNotPaid, 'Orders Not Paid');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  a.download = `Orders_Report_${startDate}_${endDate}.xlsx`;
  document.body.appendChild(a);
  a.click();

  // Xoá element link sau khi tải
  document.body.removeChild(a);

  // Giải phóng URL object
  URL.revokeObjectURL(url);
  showToast(`Hoàn thành xử lý dữ liệu`);
}

// Hàm chuyển đổi từ binary string sang ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}
