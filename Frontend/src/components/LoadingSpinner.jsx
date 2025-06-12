import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'md',
  fullScreen = false,
  overlay = false,
  text = '',
  className = ''
}) => {
  // Define classes based on size
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const containerClasses = `
    ${fullScreen ? 'fixed inset-0' : 'relative'} 
    ${overlay ? 'bg-white/80 backdrop-blur-sm' : ''} 
    flex flex-col items-center justify-center
    ${className}
    ${!fullScreen && !overlay ? 'p-4' : ''}
  `.trim();

  const spinnerContent = (
    <>
      <div className="relative flex">
        <div className={`${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-primary-600 animate-spin`}></div>
        <div 
          className={`${sizeClasses[size]} rounded-full border-t-2 border-b-2 border-secondary-500 animate-spin absolute`} 
          style={{animationDelay: '-0.2s'}}
        ></div>
      </div>
      {text && (
        <p className="mt-4 text-sm text-neutral-600 text-center">
          {text}
        </p>
      )}
    </>
  );

  // If fullScreen or overlay is true, we need a container
  if (fullScreen || overlay) {
    return (
      <div className={containerClasses} style={{ zIndex: 9999 }}>
        {spinnerContent}
      </div>
    );
  }

  // Otherwise, just return the spinner itself
  return <div className={containerClasses}>{spinnerContent}</div>;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string
};

export default LoadingSpinner; 