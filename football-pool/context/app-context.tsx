import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '@/services/services-config';

type LocalDataType = {
  isAuthenticated: boolean;
  username?: string;
  theme?: string;
  token?: string;
};

type AppContextType = {
  localData: LocalDataType;
  setLocalData: (value: Partial<LocalDataType>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [localData, setLocalDataState] = useState<LocalDataType>({
    isAuthenticated: false,
    username: '',
    theme: 'light',
    token: '',
  });

  const setLocalData = (value: Partial<LocalDataType>) => {
    setLocalDataState(prev => {
      const newData = { ...prev, ...value };
      // Configurar token en axios cuando cambie
      if (newData.token) {
        setAuthToken(newData.token);
      }
      return newData;
    });
  };

  // Configurar token inicial si existe
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