import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storage_service';
import type { AuthUser } from '../types/user';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  login: (user: AuthUser) => void;
  updateUser: (fields: Partial<AuthUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storageService.getUser();
    const token     = storageService.getToken();
    if (savedUser && token) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((authUser: AuthUser) => {
    storageService.setToken(authUser.token);
    storageService.setUser(authUser);
    setUser(authUser);
  }, []);

  const updateUser = useCallback((fields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      storageService.setUser(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    storageService.clearAuth();
    setUser(null);
  }, []);

  const isProfileComplete = Boolean(
    user &&
    user.name && user.name.trim().length > 0 &&
    user.email && user.email.trim().length > 0 &&
    user.bloodGroup && user.bloodGroup.trim().length > 0
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isProfileComplete,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// comment
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
