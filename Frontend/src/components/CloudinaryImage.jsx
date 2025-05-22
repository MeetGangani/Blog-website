import React, { useState, useEffect } from 'react';

/**
 * CloudinaryImage component for reliable image loading from Cloudinary
 * 
 * @param {string} src - The image URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS class names
 * @param {string} fallback - Text to display if image fails to load (usually initials)
 * @param {object} imgProps - Additional props to pass to the img element
 */
const CloudinaryImage = ({ 
  src, 
  alt = "User", 
  className = "", 
  fallback = "U",
  ...imgProps 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Reset state when src changes
    setLoaded(false);
    setError(false);
  }, [src]);
  
  // Check if src is a valid URL
  const isValidUrl = src && (src.startsWith('http://') || src.startsWith('https://'));
  
  if (!isValidUrl) {
    // If no valid URL, render fallback immediately
    return (
      <div className={`flex items-center justify-center h-full w-full bg-primary-100 ${className}`}>
        <span className="text-xl font-bold text-primary-600">{fallback}</span>
      </div>
    );
  }
  
  // Handle successful load
  const handleLoad = () => {
    console.log(`✅ CloudinaryImage: Successfully loaded image for ${alt}:`, src);
    setLoaded(true);
    setError(false);
  };
  
  // Handle load error
  const handleError = () => {
    console.error(`❌ CloudinaryImage: Failed to load image for ${alt}:`, src);
    setLoaded(false);
    setError(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Fallback shown while loading or on error */}
      {(!loaded || error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-100 z-0">
          <span className="text-xl font-bold text-primary-600">{fallback}</span>
        </div>
      )}
      
      {/* Only render img if we have a valid URL */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${error ? 'hidden' : ''} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"
        loading="eager"
        style={{ opacity: loaded ? 1 : 0 }}
        {...imgProps}
      />
    </div>
  );
};

export default CloudinaryImage; 