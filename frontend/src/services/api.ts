import axios from 'axios';

// 🔥 استخدم المسار النسبي وليس المسار الكامل
const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // للتطوير
    // baseURL: '/api',                    // للإنتاج مع nginx
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