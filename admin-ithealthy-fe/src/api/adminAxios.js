import axios from "axios";
import { clearAdminSession, getAdminToken } from "../utils/adminAuth";

const API_BASE = "http://localhost:5000/api";
let isConfigured = false;

function isApiRequest(url = "") {
  return typeof url === "string" && (url.startsWith(API_BASE) || url.startsWith("/api"));
}

export function setupAdminAxiosInterceptors() {
  if (isConfigured) return;

  axios.interceptors.request.use((config) => {
    if (!isApiRequest(config.url) || config.url.includes("/auth/login-admin")) {
      return config;
    }

    const token = getAdminToken();
    if (!token) return config;

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || "";

      if ((status === 401 || status === 403) && isApiRequest(requestUrl) && !requestUrl.includes("/auth/login-admin")) {
        clearAdminSession();

        if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
          window.location.replace("/admin/login");
        }
      }

      return Promise.reject(error);
    }
  );

  isConfigured = true;
}
