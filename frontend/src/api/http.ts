import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Для передачи httpOnly refreshToken
});

// Автоподстановка Bearer access token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Авторефреш при 401
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (data.accessToken) {
          localStorage.setItem('access_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return http(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);