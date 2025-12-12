import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  try {
    const cleanToken = token.replace('Bearer ', '');
    const parts = cleanToken.split('.');
    
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      return payload.userId || payload.sub || payload._id || payload.id || null;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  
  return null;
};

const STORAGE_KEY = '@football_pool:auth_data';

axiosBase.interceptors.request.use(async (config) => {
  let tokenToUse: string | null = null;
  
  if (authToken) {
    tokenToUse = authToken;
  } else {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.token) {
          tokenToUse = parsedData.token;
          authToken = parsedData.token;
        }
      }
    } catch (error) {
      // Ignorar errores de AsyncStorage
    }
  }
  
  if (tokenToUse) {
    if (tokenToUse.startsWith('Bearer ')) {
      config.headers.Authorization = tokenToUse;
    } else {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }
  }
  
  const fullURL = `${config.baseURL}${config.url}`;
  const authHeader = config.headers.Authorization as string | undefined;
  let tokenInfo: any = { hasToken: !!authHeader };
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        tokenInfo = {
          hasToken: true,
          tokenLength: token.length,
          userId: payload.userId || payload.sub || 'N/A',
          email: payload.email || 'N/A',
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
          isExpired: payload.exp ? Date.now() / 1000 > payload.exp : 'Unknown',
        };
      } catch (e) {
        tokenInfo.tokenLength = token.length;
        tokenInfo.decodeError = 'Could not decode token payload';
      }
    } else {
      tokenInfo.tokenFormat = 'Invalid JWT format';
    }
  }
    
  return config;
});

axiosBase.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      
      const isPredictionNotFound = 
        (error.config?.url?.includes('/predict') || error.config?.url?.includes('/predictions')) && 
        error.response.status === 500 &&
        (error.response.data?.error?.includes('Error getting prediction') ||
         error.response.data?.error?.includes('prediction') ||
         error.response.data?.error?.includes('Internal Server Error'));
      
      const isBackendTypeConversionError = 
        error.config?.url?.includes('/groups') && 
        error.config?.method === 'get' &&
        error.response.status === 500 &&
        (error.response.data?.error?.includes('converting from type') ||
         error.response.data?.error?.includes('converter') ||
         error.response.data?.error?.includes('No converter found'));
      
      if (!isPredictionNotFound && !isBackendTypeConversionError) {
        console.error('❌ API ERROR:', {
          status: error.response.status,
          url: error.config?.url,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (isPredictionNotFound) {
        // Filtrar errores esperados de predicciones - solo log sin interrumpir
        console.warn('⚠️ Prediction endpoint error (expected):', {
          status: error.response.status,
          url: error.config?.url,
          error: error.response.data?.error,
        });
      } else if (isBackendTypeConversionError) {
        console.warn('⚠️ Backend Type Conversion Error (known issue):', {
          status: error.response.status,
          url: error.config?.url,
          error: error.response.data?.error,
          message: 'This is a backend bug that needs to be fixed. See BACKEND_GROUPS_DATE_CONVERSION_ERROR.md',
        });
      }
    } else if (error.request) {
      console.warn('❌ NO RESPONSE:', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.warn('❌ REQUEST ERROR:', {
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default axiosBase;