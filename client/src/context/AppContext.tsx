import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNgoConfig } from '../utils/api_request/ngo';
import type { NgoConfig } from '../types/ngo';

const DEFAULT_NGO_CONFIG: NgoConfig = {
  name:               import.meta.env.VITE_NGO_NAME    || 'NGO Foundation',
  tagline:            'Empowering Communities, Changing Lives',
  logoUrl:            '',
  address:            '',
  phone:              import.meta.env.VITE_ADMIN_PHONE  || '',
  email:              import.meta.env.VITE_ADMIN_EMAIL  || '',
  registrationNumber: '',
  upiId:              import.meta.env.VITE_NGO_UPI_ID   || '',
  upiName:            import.meta.env.VITE_NGO_UPI_NAME || '',
  signatureUrl:       '',
  presidentName:      '',
  secretaryName:      '',
  foundedYear:        2020,
};

interface AppContextType {
  ngoConfig: NgoConfig;
  setNgoConfig: (config: NgoConfig) => void;
  isConfigLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ngoConfig, setNgoConfigState] = useState<NgoConfig>(DEFAULT_NGO_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    getNgoConfig()
      .then(setNgoConfigState)
      .catch(() => { /* use defaults */ })
      .finally(() => setIsConfigLoading(false));
  }, []);

  const setNgoConfig = useCallback((config: NgoConfig) => {
    setNgoConfigState(config);
  }, []);

  return (
    <AppContext.Provider value={{ ngoConfig, setNgoConfig, isConfigLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export default AppContext;
