import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
export const AUTH_STORAGE_KEY = "campuskart.auth";

export const getStoredAuth = () => {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export default apiClient;
