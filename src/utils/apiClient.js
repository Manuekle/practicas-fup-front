// apiClient.js
import axios from 'axios';
import { useAuthStore } from '@/state/pinia'; // Importa el store de autenticación

const apiClient = axios.create({
  baseURL: `${process.env.VUE_APP_BASE_API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token desde Pinia
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // Obtiene el store de autenticación
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const originalRequest = error.config
      if (error.response.status === 401 && !originalRequest.url.includes('/login')) {
        const authStore = useAuthStore();
        authStore.logout();
        window.location.reload(true)
      }
    }
    return Promise.reject(error);
  }
);

const request = async (method, url, data = null, params = {}) => {
  const headers = {
    "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json"
  };
  const response = await apiClient({
    method,
    url,
    data,
    params,
    headers
  });
  return response.data;

};

export default {
  get: (url, params) => request('GET', url, null, params),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url),
};
