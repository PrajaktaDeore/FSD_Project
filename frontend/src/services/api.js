import axios from 'axios';

const rawBaseUrl = (import.meta.env?.VITE_API_BASE_URL ?? '').trim();
const API_BASE_URL = rawBaseUrl
    ? rawBaseUrl.replace(/\/+$/, '')
    : (import.meta.env?.DEV ? 'http://localhost:8000' : '');

const rawApiPrefix = (import.meta.env?.VITE_API_PREFIX ?? '').trim();
const API_PREFIX = rawApiPrefix
    ? `/${rawApiPrefix.replace(/^\/+|\/+$/g, '')}`
    : '';

const API_ROOT = `${API_BASE_URL}${API_PREFIX}`;

const api = axios.create({
    baseURL: API_ROOT,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('staffToken');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;
        const isAuth403 =
            status === 403 &&
            typeof detail === 'string' &&
            (
                detail.toLowerCase().includes('invalid token') ||
                detail.toLowerCase().includes('token expired') ||
                detail.toLowerCase().includes('authentication credentials')
            );

        if (status === 401 || isAuth403) {
            localStorage.removeItem('staffToken');
            localStorage.removeItem('staffUser');
            const base = import.meta.env?.BASE_URL || '/';
            window.location.replace(`${base}#/login`);
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL, API_PREFIX, API_ROOT };
