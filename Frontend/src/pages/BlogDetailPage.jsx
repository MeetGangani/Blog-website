import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { FiCalendar, FiUser, FiMessageSquare, FiEdit, FiTrash } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareButton from '../components/ShareButton';
import CommentComponent from '../components/CommentComponent';

const BlogDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch blog details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await blogsAPI.getBlog(id);
        setBlog(response.data.blog);
        setIsLiked(response.data.blog.isLiked || false);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle like
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like this blog');
      return;
    }

    try {
      const response = await blogsAPI.likeBlog(id);
      setIsLiked(response.data.isLiked);
      setBlog({
        ...blog,
        likesCount: response.data.likesCount
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like blog. Please try again.');
    }
  };

  // Delete blog
  const handleDeleteBlog = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await blogsAPI.deleteBlog(id);
      toast.success('Blog deleted successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
        <p className="text-gray-600 mb-6">{error || 'Blog not found'}</p>
        <Link
          to="/blogs"
          className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  // Check if user is author of the blog
  const isAuthor = user && blog.author && user._id === blog.author._id;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Blog Header */}
      <div className="mb-8">
        {/* Category */}
        <div className="mb-4">
          <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

        {/* Author & Date */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
          <Link to={`/user/${blog.author?.username}`} className="flex items-center hover:text-primary-600">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mr-2">
              {blog.author?.profilePicture ? (
                <img
                  src={blog.author.profilePicture}
                  alt={blog.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-primary-600" />
              )}
            </div>
            <span>{blog.author?.username || 'Unknown author'}</span>
          </Link>
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>

        {/* Edit & Delete Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            {canEdit && (
              <>
                <Link
                  to={`/blogs/${blog._id}/edit`}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <FiEdit /> Edit
                </Link>
                <button
                  onClick={handleDeleteBlog}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FiTrash /> Delete
                </button>
              </>
            )}
          </div>
          <ShareButton
            title={blog.title}
            url={window.location.href}
          />
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-8">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* Blog Content */}
      <div className="prose max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {blog.tags.map((tag) => (
            <Link
              key={tag}
              to={`/blogs?tag=${tag}`}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Like & Comments Counter */}
      <div className="flex items-center gap-6 border-t border-b border-gray-100 py-4 mb-8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          {isLiked ? (
            <FaHeart className="text-red-500" size={18} />
          ) : (
            <FiHeart size={18} />
          )} 
          {blog.likesCount} Likes
        </button>
        <div className="flex items-center gap-2 text-gray-500">
          <FiMessageSquare /> {blog.commentsCount} Comments
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        {/* <h3 className="text-2xl font-bold text-gray-800 mb-6">Comments</h3> */}
        <CommentComponent blogId={id} />
      </div>
    </div>
  );
};

export default BlogDetailPage;