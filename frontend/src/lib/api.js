// Production build
// @ts-nocheck
import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://first-step-lms-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// send JWT token automatically in each request
api.interceptors.request.use((config) => {
  const token = Cookies.get("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// send to login page if 401 error occurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("jwt");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
