import axios from 'axios';

const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default axiosInstance;
