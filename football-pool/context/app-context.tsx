import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/services/services-config';

type LocalDataType = {
  isAuthenticated: boolean;
  username?: string;
  email?: string;
  userId?: string; // ID del usuario del backend
  profileImage?: string; // Base64 string de la imagen
  theme?: string;
  token?: string;
};

type AppContextType = {
  localData: LocalDataType;
  setLocalData: (value: Partial<LocalDataType>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@football_pool:auth_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [localData, setLocalDataState] = useState<LocalDataType>({
    isAuthenticated: false,
    username: '',
    theme: 'light',
    token: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setLocalDataState(parsedData);
          // Configurar token en axios inmediatamente
          if (parsedData.token) {
            setAuthToken(parsedData.token);
          }
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const setLocalData = async (value: Partial<LocalDataType>) => {
    setLocalDataState(prev => {
      const newData = { ...prev, ...value };
      // Guardar en AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData)).catch(error => {
        console.error('Error saving auth data:', error);
      });
      // Configurar token en axios cuando cambie
      if (newData.token) {
        setAuthToken(newData.token);
      } else if (value.token === null || value.token === '') {
        // Si se elimina el token, limpiar axios también
        setAuthToken(null);
      }
      return newData;
    });
  };

  // Configurar token cuando cambie
  useEffect(() => {
    if (localData.token) {
      setAuthToken(localData.token);
    }
  }, [localData.token]);

  return (
    <AppContext.Provider value={{ localData, setLocalData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};