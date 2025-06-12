import { useState, useEffect } from 'react';

const useLoading = (initialDelay = 0, minimumLoadingTime = 0) => {
  const [isLoading, setIsLoading] = useState(initialDelay > 0);
  const [showLoader, setShowLoader] = useState(initialDelay > 0);

  useEffect(() => {
    let initialTimer;
    let minimumTimer;

    if (initialDelay > 0) {
      initialTimer = setTimeout(() => {
        setIsLoading(false);
      }, initialDelay);
    }

    if (minimumLoadingTime > 0 && showLoader) {
      minimumTimer = setTimeout(() => {
        setShowLoader(false);
      }, minimumLoadingTime);
    }

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (minimumTimer) clearTimeout(minimumTimer);
    };
  }, [initialDelay, minimumLoadingTime]);

  const startLoading = () => {
    setIsLoading(true);
    setShowLoader(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    if (minimumLoadingTime === 0) {
      setShowLoader(false);
    }
  };

  return {
    isLoading,
    showLoader,
    startLoading,
    stopLoading
  };
};

export default useLoading; 