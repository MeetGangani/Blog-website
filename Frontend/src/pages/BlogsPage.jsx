import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogsAPI.getAllBlogs({
          page: currentPage,
          search: searchQuery,
          category: selectedCategory
        });
        
        setBlogs(response.data.blogs);
        setCategories(response.data.categories);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateSearchParams();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateSearchParams();
    window.scrollTo(0, 0);
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Loading state
  if (loading && blogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading blogs..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        {/* Search and Filter Section */}
        <div className="w-full md:w-64 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-800">Categories</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  <FiFilter className="inline mr-1" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {showFilters && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      !selectedCategory
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat._id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center ${
                        selectedCategory === cat._id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{cat._id}</span>
                      <span className="text-xs text-neutral-500">({cat.count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-600 hover:text-neutral-800 flex items-center"
              >
                <FiX className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="flex-1">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-neutral-800 mb-2">No blogs found</h3>
              <p className="text-neutral-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogsPage; 