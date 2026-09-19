import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("jacral_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("jacral_access_token");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
