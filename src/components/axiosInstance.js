import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://www.gachara.store/api',
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to update the token
export const setAuthToken = (getToken) => {
    axiosInstance.interceptors.request.use(
        async (config) => {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

// Global response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default axiosInstance;
