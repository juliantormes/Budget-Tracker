import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://budget-tracker-production-c5da.up.railway.app/api',
});

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error); // Log request error
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Response error:', error); // Log response error
    return Promise.reject(error);
  }
);

export default axiosInstance;
