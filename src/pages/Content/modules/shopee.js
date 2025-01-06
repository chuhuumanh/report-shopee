const { get, post } = require('./request');

async function requestOrderReport(startDate, endDate) {
  const request = await get(
    `https://banhang.shopee.vn/api/v3/order/request_order_report?SPC_CDS=9f487021-601d-45be-af5c-bb06ca288327&SPC_CDS_VER=2&start_date=${startDate}&end_date=${endDate}&language=vn&screening_condition=order_creation_date&parcel_level_filter=0`
  );

  return request;
}

async function exportWalletTransaction(data) {
  const request = await post(
    `https://banhang.shopee.vn/api/v4/seller/local_wallet/export_wallet_transactions?SPC_CDS=b61cafa6-1d4a-4531-a57a-3048dbc764e9&SPC_CDS_VER=2`,
    data
  );

  return request;
}

async function getReportById(reportId) {
  const request = await get(
    `https://banhang.shopee.vn/api/v3/settings/get_report/?&SPC_CDS=b61cafa6-1d4a-4531-a57a-3048dbc764e9&SPC_CDS_VER=2&report_id=${reportId}
    `
  );

  return request;
}

async function getWalletReportById(reportId) {
  const request = await get(
    `https://banhang.shopee.vn/api/v4/seller/local_wallet/get_wallet_transaction_report?SPC_CDS=b61cafa6-1d4a-4531-a57a-3048dbc764e9&SPC_CDS_VER=2&report_id=${reportId}`
  );

  return request;
}

module.exports = { requestOrderReport, getReportById, exportWalletTransaction, getWalletReportById };
