import axios from "axios";
import { Platform } from "react-native";

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return "http://10.0.2.2:8080/football-pool/v1/api/";
  }
  return "http://localhost:8080/football-pool/v1/api/";
};

const axiosBase = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

axiosBase.interceptors.request.use((config) => {
  // Configure token
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : undefined;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {
    }
  }
  
  // Request log
  const fullURL = `${config.baseURL}${config.url}`;
  console.log('🌐 API REQUEST:', {
    method: config.method?.toUpperCase(),
    url: fullURL,
    hasToken: !!config.headers.Authorization,
    token: config.headers.Authorization ? `${String(config.headers.Authorization).substring(0, 20)}...` : 'None',
  });
  
  return config;
});

// Response interceptor (catch errors with detail)
axiosBase.interceptors.response.use(
  (response) => {
    // Successful response log
    console.log('✅ API RESPONSE:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    // Error log with details
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('❌ API ERROR:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ NO RESPONSE:', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      // Something happened while setting up the request
      console.error('❌ REQUEST ERROR:', {
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default axiosBase;