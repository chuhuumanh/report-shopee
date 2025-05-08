import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://117.2.91.138:5997',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
    ['ngrok-skip-browser-warning']: true,
  },
});

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
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

const uploadVideoFile = (formData) => {
  return axiosInstance.post(`/shopee/upload-videos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export { get, post, put, del, excute, postFile, uploadVideoFile };
