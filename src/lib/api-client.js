import axios from "axios";

const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("/api/v1/auth/refresh", { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else {
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
