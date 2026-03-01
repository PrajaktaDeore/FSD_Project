import axios from 'axios';
import { API_BASE_URL } from './api';

const customerApi = axios.create({
    baseURL: API_BASE_URL,
});

export default customerApi;
