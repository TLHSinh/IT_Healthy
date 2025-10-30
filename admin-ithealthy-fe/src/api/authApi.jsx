import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Tạo instance axios riêng cho auth
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: (data) => axiosInstance.post(`/login`, data),
  register: (data) => axiosInstance.post(`/register`, data),
  verifyOtp: (data) => axiosInstance.post(`/verify-otp`, data),
};
