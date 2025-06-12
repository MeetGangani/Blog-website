import React from 'react';
import useLoading from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';
import withLoading from './withLoading';

// Example 1: Direct usage of LoadingSpinner
const SimpleLoadingExample = () => (
  <div className="p-4">
    <LoadingSpinner 
      size="md"
      text="Loading..."
    />
  </div>
);

// Example 2: Using the useLoading hook
const HookExample = () => {
  const { showLoader, startLoading, stopLoading } = useLoading(0, 1000);

  const handleClick = () => {
    startLoading();
    // Simulate an API call
    setTimeout(stopLoading, 2000);
  };

  return (
    <div className="p-4">
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-primary-600 text-white rounded"
      >
        Load Data
      </button>
      {showLoader && (
        <LoadingSpinner 
          overlay
          text="Loading data..."
        />
      )}
    </div>
  );
};

// Example 3: Using the withLoading HOC
const MyComponent = ({ data }) => (
  <div className="p-4">
    <h2>My Component</h2>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

const MyComponentWithLoading = withLoading(MyComponent, {
  spinnerSize: 'lg',
  overlay: true,
  loadingText: 'Loading component...'
});

// Usage examples
const ExampleUsage = () => {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData({ message: 'Data loaded!' });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Simple Spinner</h3>
        <SimpleLoadingExample />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Hook Usage</h3>
        <HookExample />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">HOC Usage</h3>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-primary-600 text-white rounded mb-4"
        >
          Load With HOC
        </button>
        <MyComponentWithLoading 
          isLoading={isLoading}
          data={data}
        />
      </section>
    </div>
  );
};

export default ExampleUsage; 