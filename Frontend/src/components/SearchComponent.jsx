import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

/**
 * SearchComponent for blogs
 * Handles search query and category filtering
 * Syncs with URL parameters
 */
const SearchComponent = ({ 
  categories = [],
  className = '' 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    
    // Navigate with the search parameters
    navigate({
      pathname: '/blogs',
      search: params.toString()
    });
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    navigate('/blogs');
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative mt-1 flex items-center">
            <input
              type="text"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
              <button
                type="submit"
                className="inline-flex items-center border border-transparent rounded-md px-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <FiSearch 
                  className="h-5 w-5 text-gray-400" 
                  aria-hidden="true" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchComponent; 