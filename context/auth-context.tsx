import { getToken, removeToken } from '@/utils/auth-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getToken().then(token => setIsAuthenticated(!!token));
  }, []);

  const setAuthenticated = (auth: boolean) => {
    setIsAuthenticated(auth);
  };

  const logout = async () => {
    await removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
