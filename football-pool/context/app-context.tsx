import React, { createContext, ReactNode, useContext, useState } from 'react';

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
    setLocalDataState(prev => ({ ...prev, ...value }));
  };

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