import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("Axios request interceptor - URL:", config.url);
    console.log("Axios request interceptor - Method:", config.method);
    console.log("Axios request interceptor - Token exists:", !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Axios request interceptor - Authorization header set");
    }
    console.log("Axios request interceptor - Final headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Axios response interceptor - Status:", response.status);
    console.log("Axios response interceptor - Data:", response.data);
    return response;
  },
  (error) => {
    console.error("Axios response interceptor error:", error);
    if (error.response) {
      console.error("Axios error response - Status:", error.response.status);
      console.error("Axios error response - Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
