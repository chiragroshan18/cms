import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isSessionExpiredDispatched = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle genuine HTTP 401 Unauthorized responses (token invalid/expired).
    // Ignore network errors, 5xx server errors, timeouts, or 403 Forbidden status codes.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');

      if (!isSessionExpiredDispatched) {
        isSessionExpiredDispatched = true;
        window.dispatchEvent(
          new CustomEvent('cms:session-expired', {
            detail: 'Your session has expired. Please log in again.',
          })
        );
        // Reset flag after 3 seconds to allow future valid logins/expirations
        setTimeout(() => {
          isSessionExpiredDispatched = false;
        }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
