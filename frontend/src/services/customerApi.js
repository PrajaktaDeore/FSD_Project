import axios from 'axios';
import { API_ROOT } from './api';

const customerApi = axios.create({
    baseURL: API_ROOT,
});

export default customerApi;
