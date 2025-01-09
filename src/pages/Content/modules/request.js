const axios = require('axios');
const XLSX = require('xlsx');
const JSZip = require('jszip');

async function get(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error; // Rethrow error for caller to handle if needed
  }
}

async function post(url, data) {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error; // Rethrow error for caller to handle if needed
  }
}

async function reportXLSX(reportId) {
  try {
    // Tải file Excel từ API
    const response = await axios.get(
      `https://banhang.shopee.vn/api/v3/settings/download_report/?&SPC_CDS=b61cafa6-1d4a-4531-a57a-3048dbc764e9&SPC_CDS_VER=2&report_id=${reportId}`,
      { responseType: 'arraybuffer' } // Quan trọng: Định dạng dữ liệu trả về
    );

    // Chuyển đổi dữ liệu từ arraybuffer sang Uint8Array
    const data = new Uint8Array(response.data);

    // Dùng thư viện xlsx để đọc dữ liệu
    const workbook = XLSX.read(data, { type: 'array' });

    // Giả sử đọc sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Chuyển đổi sheet sang JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    // Trả về JSON nếu cần
    return jsonData;
  } catch (error) {
    console.error('Lỗi tải hoặc xử lý file Excel:', error);
    throw error;
  }
}

async function reportWalletXLSX(reportId) {
  try {
    // Tải file từ API
    const response = await axios.get(
      `https://banhang.shopee.vn/api/v4/seller/local_wallet/download_wallet_transaction_report?report_id=${reportId}`,
      { responseType: 'arraybuffer' } // Định dạng dữ liệu trả về
    );

    // Mảng chứa tất cả dữ liệu (cho cả ZIP và file XLSX đơn)
    const allData = [];

    // Kiểm tra xem file có phải là ZIP không
    if (response.headers['content-disposition'].indexOf('.zip') !== -1) {
      // Nếu là ZIP, giải nén và xử lý các file XLSX bên trong
      const zip = await JSZip.loadAsync(response.data);

      // Duyệt qua các file trong ZIP
      for (const filename of Object.keys(zip.files)) {
        if (filename.endsWith('.xlsx')) {
          const fileData = await zip.files[filename].async('arraybuffer');
          const workbook = XLSX.read(fileData, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Đọc sheet đầu tiên
          const fileJson = XLSX.utils.sheet_to_json(sheet);
          allData.push(...fileJson); // Gom chung dữ liệu vào mảng allData
        }
      }
    } else {
      // Nếu không phải ZIP, xử lý như bình thường
      const data = new Uint8Array(response.data);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      allData.push(...XLSX.utils.sheet_to_json(sheet)); // Gom chung dữ liệu vào mảng allData
    }

    return allData; // Trả về mảng dữ liệu chung
  } catch (error) {
    console.error('Lỗi tải hoặc xử lý file:', error);
    throw error;
  }
}

module.exports = { post, get, reportXLSX, reportWalletXLSX };
