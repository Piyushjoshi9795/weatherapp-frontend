// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // sends cookies (refresh token) automatically
});

// ── Request interceptor ───────────────────────────────────
// Runs before every request — attaches the access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  // Wait — why localStorage here if we said it's insecure?
  // Access tokens are SHORT-LIVED (15 min). Even if stolen,
  // they expire fast. The sensitive refresh token is in HttpOnly cookie.
  // This is the accepted trade-off for SPAs.
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────
// Runs after every response — handles 403 (token expired)
let isRefreshing = false;
let failedQueue = []; // holds requests that came in while we were refreshing

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // success — just pass through

  async (error) => {
    const originalRequest = error.config;

    // If we got a 403 AND we haven't already tried to refresh
    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest); // retry with new token
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — sends HttpOnly cookie automatically
        const response = await api.post('/auth/refresh');
        const newToken = response.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        api.defaults.headers['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest); // retry the original failed request
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — session truly expired, force login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;