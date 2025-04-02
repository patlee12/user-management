import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log(
  'AXIOS:::::::::::::::::NEXT_PUBLIC_BACKEND_URL',
  process.env.NEXT_PUBLIC_BACKEND_URL,
);
export default axiosInstance;
