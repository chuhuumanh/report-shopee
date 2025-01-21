import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5997',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Xử lý response thành công
    return response.data;
  },
  (error) => {
    // Xử lý lỗi từ response
    if (error.response) {
      console.error('Response error:', error.response);
    } else {
      console.error('Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Các method tiện ích
const get = (url, params = {}) => axiosInstance.get(url, { params });
const post = (url, data = {}) => axiosInstance.post(url, data);
const put = (url, data = {}) => axiosInstance.put(url, data);
const del = (url) => axiosInstance.delete(url);

const excute = (data) => axiosInstance.post(`/shopee/excute`, data);

const postFile = (url, formData) => {
  return axiosInstance.post(`/uploads`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export { get, post, put, del, excute, postFile };
