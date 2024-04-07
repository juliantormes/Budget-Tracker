import axios from 'axios';
import { useAuth } from './AuthContext';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Assume your Django backend uses Basic Auth for simplicity
axiosInstance.interceptors.request.use((config) => {
  const { credentials } = useAuth();
  const { username, password } = credentials;
  if (username && password) {
    config.headers['Authorization'] = `Basic ${window.btoa(username + ':' + password)}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
