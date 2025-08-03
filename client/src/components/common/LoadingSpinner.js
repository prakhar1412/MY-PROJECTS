import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = '',
  overlay = false,
  className = '' 
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  const spinnerClasses = `
    ${sizeClasses[size]} 
    border-4 
    ${colorClasses[color]} 
    border-t-transparent 
    rounded-full 
    animate-spin
    ${className}
  `;

  const Spinner = () => (
    <motion.div
      className={spinnerClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner />
      {text && (
        <motion.p 
          className="text-sm text-secondary font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  // Render with overlay if specified
  if (overlay) {
    return (
      <motion.div 
        className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  // Render inline spinner
  return content;
};

// Full screen loading component
export const FullScreenLoader = ({ text = 'Loading...', logo = true }) => {
  return (
    <div className="fixed inset-0 bg-primary flex items-center justify-center z-50">
      <div className="text-center">
        {logo && (
          <motion.div 
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">Modern Todo</h1>
          </motion.div>
        )}
        
        <LoadingSpinner size="lg" text={text} />
        
        <motion.div 
          className="mt-8 text-xs text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Powered by Modern Todo
        </motion.div>
      </div>
    </div>
  );
};

// Button with loading state
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`
        relative 
        inline-flex 
        items-center 
        justify-center 
        transition-all 
        duration-200
        ${loading || disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Card skeleton loader
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-tertiary rounded-lg p-6 space-y-4">
        <div className="h-4 bg-border-light rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-border-light rounded"></div>
          <div className="h-3 bg-border-light rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 w-16 bg-border-light rounded-full"></div>
          <div className="h-6 w-20 bg-border-light rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// List skeleton loader
export const SkeletonList = ({ items = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 bg-secondary rounded-lg">
            <div className="w-4 h-4 bg-border-light rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border-light rounded w-2/3"></div>
              <div className="h-3 bg-border-light rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-border-light rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;