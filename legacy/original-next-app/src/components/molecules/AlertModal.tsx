'use client';

import React from 'react';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getButtonClassName = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-0';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white border-0';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white border-0';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-0';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Icon */}
            {getIcon()}

            {/* Title */}
            {title && (
              <h3 className={cn('text-2xl font-bold text-center mb-2', getTitleColor())}>
                {title}
              </h3>
            )}

            {/* Message */}
            <p className="text-gray-700 text-center mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className={cn('flex gap-3', showCancel ? 'justify-between' : 'justify-center')}>
              {showCancel && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleConfirm}
                className={cn('flex-1', getButtonClassName())}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

