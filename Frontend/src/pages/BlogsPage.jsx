import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import { FiSearch, FiFilter } from 'react-icons/fi';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });
  const [totalPages, setTotalPages] = useState(1);

  // Categories for filter
  const categories = [
    'All',
    'Technology',
    'Lifestyle',
    'Business',
    'Travel',
    'Health',
    'Food',
    'Sports',
    'Other',
  ];

  // Fetch blogs when filters change
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        // Prepare query params
        const params = {
          page: filters.page,
          limit: 9, // Number of blogs per page
        };

        if (filters.search) params.search = filters.search;
        if (filters.category && filters.category !== 'All') params.category = filters.category;
        if (filters.tag) params.tag = filters.tag;

        // Update URL with filters
        setSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value) acc.append(key, value);
            return acc;
          }, new URLSearchParams())
        );

        // Fetch blogs
        const response = await blogsAPI.getAllBlogs(params);
        setBlogs(response.data.blogs || []);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filters, setSearchParams]);

  // Handle search input
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 }); // Reset page to 1 when searching
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setFilters({
      ...filters,
      category: category === 'All' ? '' : category,
      page: 1, // Reset page to 1 when changing category
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading && blogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  // Error state
  if (error && blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => setFilters({ ...filters, page: 1 })}
          className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Explore Blogs</h1>

      {/* Search and Filters */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter button (mobile) */}
          <div className="md:hidden">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md">
              <FiFilter /> Filters
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                (category === 'All' && !filters.category) || filters.category === category
                  ? 'bg-indigo-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs grid */}
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className={`px-3 py-1 rounded ${
                filters.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  filters.page === i + 1
                    ? 'bg-indigo-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === totalPages}
              className={`px-3 py-1 rounded ${
                filters.page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BlogsPage; 