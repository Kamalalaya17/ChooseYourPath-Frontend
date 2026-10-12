import axios from "axios";

// REST client for the Spring Boot backend (backend/ folder).
// Base URL can be overridden with VITE_API_URL.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 15000,
});

export function getToken() {
  return localStorage.getItem("cyp_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("cyp_token", token);
  else localStorage.removeItem("cyp_token");
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

let refreshing = false;
let pending = [];

function onRefreshed() {
  pending.forEach((cb) => cb());
  pending = [];
}

// Simple retry with backoff for network errors (no token refresh loop —
// 401s are surfaced to the caller so screens can redirect to login).
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;
    const networkError = !error.response;
    if (networkError && config.__retryCount < 2) {
      config.__retryCount += 1;
      await new Promise((r) => setTimeout(r, 400 * config.__retryCount));
      return api(config);
    }
    if (error.response && error.response.status === 401 && !refreshing) {
      refreshing = true;
      setTimeout(() => {
        localStorage.removeItem("cyp_token");
        localStorage.removeItem("cyp_user");
        refreshing = false;
        onRefreshed();
        if (!location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }, 0);
    }
    return Promise.reject(error);
  },
);

export default api;
