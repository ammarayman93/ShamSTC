/// <reference types="vite/client" />
import axios from 'axios';

// يستخدم التطوير عنوان الخادم المحلي، بينما يمر الإنتاج عبر Nginx
// في المسار نفسه. ويمكن ضبط عنوان آخر صراحةً عبر VITE_API_BASE_URL.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
    baseURL: apiBaseUrl,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;