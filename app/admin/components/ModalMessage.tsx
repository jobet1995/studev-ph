"use client";

import { useEffect } from 'react';

/**
 * Props for the ModalMessage component
 * @property {boolean} isOpen - Controls whether the modal is visible
 * @property {() => void} onClose - Function to close the modal
 * @property {string} title - Title text for the modal
 * @property {string} message - Main message content
 * @property {'success' | 'error' | 'warning' | 'info'} type - Type of message determining styling
 * @property {boolean} [autoClose=true] - Whether the modal should close automatically
 * @property {number} [autoCloseDelay=3000] - Delay in milliseconds before auto-closing
 */
interface ModalMessageProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Modal message component for displaying notifications
 * Shows success, error, warning, or info messages with optional auto-close
 * @param {ModalMessageProps} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message content
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Message type
 * @param {boolean} [props.autoClose=true] - Whether to auto-close the modal
 * @param {number} [props.autoCloseDelay=3000] - Auto-close delay in milliseconds
 * @returns {JSX.Element | null} Modal message component
 */
export default function ModalMessage({
  isOpen,
  onClose,
  title,
  message,
  type,
  autoClose = true,
  autoCloseDelay = 3000
}: ModalMessageProps) {
  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  // Get icon and styling based on message type
  /**
   * Returns appropriate icon and styling based on the message type
   * @returns {{icon: JSX.Element, bgColor: string, borderColor: string, textColor: string}} Object containing icon and styling classes
   */
  const getIconAndStyle = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'info':
      default:
        return {
          icon: (
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getIconAndStyle();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className={`${bgColor} ${borderColor} border-b p-4`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {icon}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <h3 className={`text-lg font-medium ${textColor}`}>
                  {title}
                </h3>
                <div className={`mt-2 text-sm ${textColor}`}>
                  <p>{message}</p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  className={`${textColor} hover:opacity-75 focus:outline-none`}
                  onClick={onClose}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}