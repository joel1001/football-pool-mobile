import React, { createContext, ReactNode, useContext, useState } from 'react';

type AppContextType = {
  localData: string;
  setLocalData: (value: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [localData, setLocalData] = useState('');

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