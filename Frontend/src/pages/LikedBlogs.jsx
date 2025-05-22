import React, { useEffect, useState } from 'react';
import { blogsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const LikedBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchLikedBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogsAPI.getLikedBlogs({ page: currentPage });
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching liked blogs:', err);
        setError('Failed to load liked blogs. Please try again later.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLikedBlogs();
    }
  }, [isAuthenticated, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Redirect if not logged in
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-800 mb-8">
        Blogs You've Liked
      </h1>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-20">
          <LoadingSpinner />
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-8 text-center bg-neutral-50 rounded-lg">
          <h3 className="text-xl font-medium text-neutral-600">No liked blogs yet</h3>
          <p className="mt-2 text-neutral-500">
            You haven't liked any blogs yet. Explore our blogs and like the ones you enjoy!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
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
  );
};

export default LikedBlogs; 