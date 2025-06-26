// utils/toastUtils.js
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import React from 'react';

// Componente customizado para o toast com ícone
const ToastContent = ({ icon, message }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0">
      {icon}
    </div>
    <span className="text-sm font-medium">{message}</span>
  </div>
);

// Funções de toast customizadas com ícones do react-icons
export const customToast = {
  success: (message, options = {}) => {
    return toast.success(
      <ToastContent 
        icon={<FaCheckCircle className="text-green-500 text-lg" />} 
        message={message} 
      />,
      {
        className: 'bg-green-50 text-green-800 border-l-4 border-green-500',
        ...options,
      }
    );
  },

  error: (message, options = {}) => {
    return toast.error(
      <ToastContent 
        icon={<FaTimes className="text-red-500 text-lg" />} 
        message={message} 
      />,
      {
        className: 'bg-red-50 text-red-800 border-l-4 border-red-500',
        ...options,
      }
    );
  },

  warning: (message, options = {}) => {
    return toast.warning(
      <ToastContent 
        icon={<FaExclamationTriangle className="text-yellow-500 text-lg" />} 
        message={message} 
      />,
      {
        className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
        ...options,
      }
    );
  },

  info: (message, options = {}) => {
    return toast.info(
      <ToastContent 
        icon={<FaInfoCircle className="text-blue-500 text-lg" />} 
        message={message} 
      />,
      {
        className: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500',
        ...options,
      }
    );
  },
};

// Exportar apenas o customToast
export default customToast;
