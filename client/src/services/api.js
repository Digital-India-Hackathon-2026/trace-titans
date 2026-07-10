import axios from "axios";

// Dynamically determine the backend URL so that other devices on the same local network can connect
const baseURL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const API = axios.create({
  baseURL,
});

// Interceptor to attach JWT token to headers if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
