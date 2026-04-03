'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Customer, CustomerLoginData, CustomerRegistrationData } from '@/types/customer';

// Customer Auth State
interface CustomerAuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

// Customer Auth Context Type
interface CustomerAuthContextType extends CustomerAuthState {
  login: (credentials: CustomerLoginData) => Promise<void>;
  register: (data: CustomerRegistrationData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshCustomer: () => Promise<void>;
}

// Initial state
const initialState: CustomerAuthState = {
  customer: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

// Action types
type CustomerAuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { customer: Customer; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function customerAuthReducer(state: CustomerAuthState, action: CustomerAuthAction): CustomerAuthState {
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
        customer: action.payload.customer,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        customer: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        customer: null,
        token: null,
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
const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

// Provider component
export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(customerAuthReducer, initialState);

  // Load customer from localStorage on mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem('zbk_customer');
    const savedToken = localStorage.getItem('zbk_customer_token');
    
    if (savedCustomer && savedToken) {
      try {
        const customer = JSON.parse(savedCustomer);
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { customer, token: savedToken } 
        });
      } catch (error) {
        localStorage.removeItem('zbk_customer');
        localStorage.removeItem('zbk_customer_token');
      }
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: CustomerLoginData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        const { customer, token } = data;
        
        // Save to localStorage
        localStorage.setItem('zbk_customer', JSON.stringify(customer));
        localStorage.setItem('zbk_customer_token', token);
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { customer, token } 
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: CustomerRegistrationData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      if (result.success) {
        const { customer, token } = result;
        
        // Save to localStorage
        localStorage.setItem('zbk_customer', JSON.stringify(customer));
        localStorage.setItem('zbk_customer_token', token);
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { customer, token } 
        });
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('zbk_customer');
    localStorage.removeItem('zbk_customer_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Refresh customer data (for profile updates)
  const refreshCustomer = useCallback(async () => {
    const token = localStorage.getItem('zbk_customer_token');
    if (!token) return;

    try {
      // You can add an API endpoint to get current customer data
      // For now, we'll keep the existing customer data
      const savedCustomer = localStorage.getItem('zbk_customer');
      if (savedCustomer) {
        const customer = JSON.parse(savedCustomer);
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { customer, token } 
        });
      }
    } catch (error) {
      console.error('Failed to refresh customer data:', error);
    }
  }, []);

  const value: CustomerAuthContextType = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshCustomer,
  }), [state, login, register, logout, clearError, refreshCustomer]);

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

// Hook to use customer auth context
export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
