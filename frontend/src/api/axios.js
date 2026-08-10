import axios from 'axios';
const api = axios.create({
    baseURL: 'https://localhost:5001/api',
    withCredentials: true,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    return config;
});
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export default api;
