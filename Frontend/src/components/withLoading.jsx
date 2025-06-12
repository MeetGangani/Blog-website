import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const withLoading = (WrappedComponent, options = {}) => {
  const {
    loadingProps = {},
    spinnerSize = 'md',
    fullScreen = false,
    overlay = false,
    loadingText = ''
  } = options;

  return function WithLoadingComponent({ isLoading, ...props }) {
    if (!isLoading) {
      return <WrappedComponent {...props} />;
    }

    return (
      <>
        {!fullScreen && !overlay && <WrappedComponent {...props} {...loadingProps} />}
        <LoadingSpinner
          size={spinnerSize}
          fullScreen={fullScreen}
          overlay={overlay}
          text={loadingText}
        />
      </>
    );
  };
};

export default withLoading; 