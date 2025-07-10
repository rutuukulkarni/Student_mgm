import axios from 'axios';

// Create an Axios instance with baseURL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
