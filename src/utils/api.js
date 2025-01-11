import axiosInstance from '../components/axiosInstance.js';

// Error handler helper
const handleError = (error) => {
    if (error.response) {
        throw new Error(error.response.data.detail || 'Server error occurred');
    } else if (error.request) {
        throw new Error('No response received from server');
    } else {
        throw new Error('Error setting up request');
    }
};

// API endpoints object
export const api = {
    dashboard: {
        getMain: async () => {
            try {
                const response = await axiosInstance.get('/dashboard/');
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    weekly: {
        getAnalysis: async (weeks = 8) => {
            try {
                const response = await axiosInstance.get(`/weekly/?weeks=${weeks}`);
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    monthly: {
        getAnalysis: async (months = 12) => {
            try {
                const response = await axiosInstance.get(`/monthly/?months=${months}`);
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    yearly: {
        getAnalysis: async () => {
            try {
                const response = await axiosInstance.get('/yearly/');
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    customers: {
        getInsights: async () => {
            try {
                const response = await axiosInstance.get('/customers-insights/');
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    products: {
        getInsights: async () => {
            try {
                const response = await axiosInstance.get('/products-insights/');
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
    patterns: {
        getAnalysis: async () => {
            try {
                const response = await axiosInstance.get('/patterns/');
                return response.data;
            } catch (error) {
                handleError(error);
            }
        },
    },
};

export default api;
