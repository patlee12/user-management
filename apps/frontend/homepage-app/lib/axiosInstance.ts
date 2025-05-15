import axios from 'axios';
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
export default axiosInstance;
