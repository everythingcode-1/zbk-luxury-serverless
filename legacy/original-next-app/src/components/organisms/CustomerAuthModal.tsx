'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import Button from '@/components/atoms/Button';
import PhoneInput from '@/components/atoms/PhoneInput';
import PasswordInput from '@/components/atoms/PasswordInput';
import { CustomerLoginData, CustomerRegistrationData, Title } from '@/types/customer';
import { User, Shield } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const router = useRouter();
  const { login, register, isLoading, error, clearError, isAuthenticated } = useCustomerAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminError, setAdminError] = useState<string>('');
  const [loginData, setLoginData] = useState<CustomerLoginData>({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState<CustomerRegistrationData>({
    title: 'MR',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsAdminMode(false);
      setAdminError('');
      clearError();
    } else {
      setLoginData({ email: '', password: '' });
      setRegisterData({
        title: 'MR',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      });
      setIsAdminMode(false);
      setAdminError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMode]);

  // Close modal and call onSuccess when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    clearError();
    
    // If admin mode is enabled, use the admin login API
    if (isAdminMode) {
      setAdminLoginLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (data.success) {
          // Store admin data
          localStorage.setItem('admin-user', JSON.stringify(data.data.user));
          localStorage.setItem('auth-token', data.data.token);
          
          // Check if user is admin or manager, then redirect to /admin
          if (data.data.user.role === 'ADMIN' || data.data.user.role === 'MANAGER') {
            onClose();
            router.push('/admin');
            return;
          } else {
            // If not admin, show error
            setAdminError('This account does not have admin privileges');
            setAdminLoginLoading(false);
            return;
          }
        } else {
          // Handle error
          setAdminError(data.message || 'Login failed. Please check your credentials.');
          setAdminLoginLoading(false);
          return;
        }
      } catch (error) {
        console.error('Admin login error:', error);
        setAdminError('Network error. Please try again.');
        setAdminLoginLoading(false);
        return;
      }
    } else {
      // Normal customer login
      try {
        await login(loginData);
      } catch (error) {
        // Error is handled by context
        console.error('Login error:', error);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
    } catch (error) {
      // Error is handled by context
      console.error('Registration error:', error);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (adminError) setAdminError('');
    if (error) clearError();
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-luxury-gold" />
              <h2 className="text-2xl font-bold text-deep-navy">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {(error || adminError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-compact">
              <p className="text-red-600 text-sm">{adminError || error}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Admin Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-compact">
                <div className="flex items-center space-x-2">
                  <Shield className={`h-4 w-4 ${isAdminMode ? 'text-luxury-gold' : 'text-gray-600'}`} />
                  <label htmlFor="admin-mode" className={`text-sm font-medium ${isAdminMode ? 'text-luxury-gold' : 'text-gray-700'}`}>
                    Admin Login
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setAdminError('');
                    clearError();
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAdminMode ? 'bg-luxury-gold' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAdminMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                  placeholder={isAdminMode ? "admin@zbkluxury.com" : "Enter your email"}
                />
              </div>

              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  isRequired
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={isLoading || adminLoginLoading}
              >
                {(isLoading || adminLoginLoading) ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Demo Credentials */}
              {!isAdminMode && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-compact">
                  <p className="text-blue-800 text-sm font-medium mb-1">Demo Customer Account:</p>
                  <p className="text-blue-600 text-xs">Email: john.doe@example.com</p>
                  <p className="text-blue-600 text-xs">Password: Password123</p>
                </div>
              )}
              
              {isAdminMode && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-compact">
                  <p className="text-amber-800 text-sm font-medium mb-1">Admin Access</p>
                  <p className="text-amber-600 text-xs">Use your admin credentials to access the admin panel</p>
                </div>
              )}
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <select
                  id="title"
                  name="title"
                  required
                  value={registerData.title}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 bg-white"
                >
                  <option value="MR">Mr.</option>
                  <option value="MS">Ms.</option>
                  <option value="MRS">Mrs.</option>
                  <option value="DR">Dr.</option>
                  <option value="PROF">Prof.</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  name="email"
                  required
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <PhoneInput
                  label="Phone Number"
                  value={registerData.phoneNumber}
                  onChange={(value) => {
                    setRegisterData({ ...registerData, phoneNumber: value });
                    if (error) clearError();
                  }}
                  placeholder="Enter phone number"
                  id="phoneNumber"
                />
              </div>

              <div>
                <PasswordInput
                  id="registerPassword"
                  name="password"
                  label="Password"
                  required
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Minimum 8 characters"
                  isRequired
                />
              </div>

              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  required
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  isRequired
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Mode Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  clearError();
                }}
                className="ml-1 text-luxury-gold hover:text-opacity-80 font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
