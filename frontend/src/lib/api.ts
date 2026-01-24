import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Check for anonymous token in response header
    const anonTokenFromHeader = response.headers["x-anonymous-token"];

    if (anonTokenFromHeader) {
      localStorage.setItem("anonAccessToken", anonTokenFromHeader);
    }

    // Also save if user is anonymous and has accessToken
    const currentToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (user && currentToken) {
      try {
        const parsedUser = JSON.parse(user);
        // If user is anonymous, always keep the token saved separately
        if (parsedUser.isAnonymous) {
          localStorage.setItem("anonAccessToken", currentToken);
        }
      } catch {
        // Ignore parse errors
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh, but only if it's not a login/register request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
