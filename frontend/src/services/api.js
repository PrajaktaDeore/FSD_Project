import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
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
            window.location.replace('/#/login');
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
