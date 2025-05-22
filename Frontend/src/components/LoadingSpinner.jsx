import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  // Define classes based on size
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="relative flex">
      <div className={`${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-primary-600 animate-spin`}></div>
      <div 
        className={`${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-secondary-500 animate-spin absolute`} 
        style={{animationDelay: '-0.2s'}}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 