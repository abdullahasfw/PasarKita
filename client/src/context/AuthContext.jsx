import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user session', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = res.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      addToast({
        title: 'Login Gagal',
        message: error.response?.data?.message || 'Terjadi kesalahan sistem',
        type: 'error'
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { user: newUser, accessToken, refreshToken } = res.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      addToast({
        title: 'Registrasi Gagal',
        message: error.response?.data?.message || 'Terjadi kesalahan sistem',
        type: 'error'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/me', data);
      setUser(res.data.data);
      addToast({
        title: 'Berhasil',
        message: 'Profil berhasil diperbarui',
        type: 'success'
      });
      return res.data.data;
    } catch (error) {
      addToast({
        title: 'Gagal',
        message: error.response?.data?.message || 'Gagal memperbarui profil',
        type: 'error'
      });
      throw error;
    }
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}
