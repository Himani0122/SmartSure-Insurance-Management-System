import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('smartsure_token');
    const storedRefresh = localStorage.getItem('smartsure_refresh');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check token expiry
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setRefreshToken(storedRefresh);
          setUser({
            username: decoded.sub,
            role: decoded.role,
          });
        } else {
          // Token expired, clean up
          localStorage.removeItem('smartsure_token');
          localStorage.removeItem('smartsure_refresh');
        }
      } catch {
        localStorage.removeItem('smartsure_token');
        localStorage.removeItem('smartsure_refresh');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((tokenValue, refreshTokenValue) => {
    const decoded = jwtDecode(tokenValue);
    setToken(tokenValue);
    setRefreshToken(refreshTokenValue);
    setUser({
      username: decoded.sub,
      role: decoded.role,
    });
    localStorage.setItem('smartsure_token', tokenValue);
    localStorage.setItem('smartsure_refresh', refreshTokenValue);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('smartsure_token');
    localStorage.removeItem('smartsure_refresh');
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;





