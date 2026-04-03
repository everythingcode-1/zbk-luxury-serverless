'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { AuthState, AuthContextType, LoginCredentials, SignupData, User } from '@/types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zbk_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('zbk_user');
      }
    }
  }, []);

  // Mock API calls - replace with actual API integration
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (credentials.email === 'demo@zbkluxury.com' && credentials.password === 'password') {
        const user: User = {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+65 9747 6453',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem('zbk_user', JSON.stringify(user));
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user creation
      const user: User = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('zbk_user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Signup failed' });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('zbk_user');
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = useMemo(() => ({
    ...state,
    login,
    signup,
    logout,
    clearError,
  }), [state, login, signup, logout, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
