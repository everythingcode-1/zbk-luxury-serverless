'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/atoms/Button';
import PhoneInput from '@/components/atoms/PhoneInput';
import PasswordInput from '@/components/atoms/PasswordInput';
import { LoginCredentials, SignupData } from '@/types/auth';
import { Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const router = useRouter();
  const { login, signup, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminError, setAdminError] = useState<string>('');
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
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
      setSignupData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
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
      // Normal user login
      await login(loginData);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(signupData);
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

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-deep-navy">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
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
                  <p className="text-blue-800 text-sm font-medium mb-1">Demo Credentials:</p>
                  <p className="text-blue-600 text-xs">Email: demo@zbkluxury.com</p>
                  <p className="text-blue-600 text-xs">Password: password</p>
                </div>
              )}
              
              {isAdminMode && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-compact">
                  <p className="text-amber-800 text-sm font-medium mb-1">Admin Credentials:</p>
                  <p className="text-amber-600 text-xs">Email: admin@zbkluxury.com</p>
                  <p className="text-amber-600 text-xs">Password: ZBKAdmin2024!</p>
                </div>
              )}
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
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
                    value={signupData.firstName}
                    onChange={handleSignupChange}
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
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="signupEmail"
                  name="email"
                  required
                  value={signupData.email}
                  onChange={handleSignupChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-compact focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <PhoneInput
                  label="Phone Number (Optional)"
                  value={signupData.phone}
                  onChange={(value) => setSignupData({ ...signupData, phone: value })}
                  placeholder="Enter phone number"
                  id="phone"
                />
              </div>

              <div>
                <PasswordInput
                  id="signupPassword"
                  name="password"
                  label="Password"
                  required
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Minimum 6 characters"
                  isRequired
                />
              </div>

              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  required
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
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
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
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

export default AuthModal;
