'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('Stored token exists:', !!storedToken);
      console.log('Stored user exists:', !!storedUser);

      if (storedToken && storedUser) {
        try {
          console.log('Verifying token with backend...');
          // Verify token is still valid
          const response = await authAPI.verifyToken();
          console.log('Token verification successful');
          setToken(storedToken);
          setUser(response.user);
        } catch (error) {
          // Token is invalid, clear storage
          console.log('Token verification failed, clearing storage', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('No stored credentials found');
      }
      setLoading(false);
      console.log('Authentication initialization complete');
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response: AuthResponse = await authAPI.login(email, password);
      console.log('Login successful, setting token and user');
      
      // まずローカルストレージに保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Token and user stored in localStorage');
      
      // 次にstateを更新
      setToken(response.token);
      setUser(response.user);
      console.log('State updated with token and user');
      
      // トークンが設定されたことを確認
      console.log('Token in localStorage:', localStorage.getItem('token'));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    passwordConfirmation: string
  ) => {
    try {
      console.log('Attempting registration...');
      const response: AuthResponse = await authAPI.register(name, email, password, passwordConfirmation);
      console.log('Registration successful, setting token and user');
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Token and user stored in localStorage');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;

  // Debug: Log authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      loading
    });
  }, [isAuthenticated, token, user, loading]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};