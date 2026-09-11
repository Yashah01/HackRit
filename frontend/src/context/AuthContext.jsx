import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cls_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cls_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('cls_user', JSON.stringify(profile));
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem('cls_token');
          localStorage.removeItem('cls_user');
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('cls_token', res.access_token);
    localStorage.setItem('cls_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('cls_token', res.access_token);
    localStorage.setItem('cls_user', JSON.stringify(res.user));
    return res;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('cls_token', res.access_token);
    localStorage.setItem('cls_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cls_token');
    localStorage.removeItem('cls_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
