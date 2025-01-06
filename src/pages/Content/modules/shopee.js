const { get } = require('./request');

async function requestOrderReport(startDate, endDate) {
  const request = await get(
    `https://banhang.shopee.vn/api/v3/order/request_order_report?SPC_CDS=9f487021-601d-45be-af5c-bb06ca288327&SPC_CDS_VER=2&start_date=${startDate}&end_date=${endDate}&language=vn&screening_condition=order_creation_date&parcel_level_filter=0`
  );

  return request;
}

module.exports = { requestOrderReport };
