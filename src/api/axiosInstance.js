// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  // Use relative path /api which Nginx proxies to backend:5000
  // This works both in Docker (proxied by Nginx) and local dev
  baseURL: '/api',
  withCredentials: true // sends cookies (refresh token) automatically
});

// ── Request interceptor ───────────────────────────────────
// Runs before every request — attaches the access token
api.interceptors.request.use((config) => { // interceptors allow us to run code before a request is sent or after a response is received. Here, we use a request interceptor to automatically attach the access token to the Authorization header of every outgoing request. This way, we don't have to manually add the token every time we call an API endpoint. The interceptor checks localStorage for the access token and, if it exists, adds it to the headers in the format "Bearer <token>". This ensures that our backend can authenticate the user for protected routes.
  const token = localStorage.getItem('accessToken');
  // Wait — why localStorage here if we said it's insecure?
  // Access tokens are SHORT-LIVED (15 min). Even if stolen,
  // they expire fast. The sensitive refresh token is in HttpOnly cookie.
  // This is the accepted trade-off for SPAs.
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // 
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