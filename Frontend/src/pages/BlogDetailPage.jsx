import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogsAPI, commentsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { FiCalendar, FiUser, FiMessageSquare, FiEdit, FiTrash } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BlogDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch blog details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await blogsAPI.getBlog(id);
        console.log('Blog data received:', {
          title: response.data.blog.title,
          hasCoverImage: !!response.data.blog.coverImage,
          coverImageUrl: response.data.blog.coverImage,
          isLiked: response.data.blog.isLiked
        });
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

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await commentsAPI.getComments(id);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        // Don't set error state, just show empty comments
      }
    };

    if (blog) {
      fetchComments();
    }
  }, [id, blog]);

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
      console.log('Like response:', response.data);
      setIsLiked(response.data.isLiked);
      // Update blog with new likes count
      setBlog({
        ...blog,
        likesCount: response.data.likesCount
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like blog. Please try again.');
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await commentsAPI.createComment(id, { content: commentText });
      setComments([response.data.comment, ...comments]);
      setCommentText('');
      // Update blog with new comment count
      setBlog({
        ...blog,
        commentsCount: blog.commentsCount + 1
      });
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
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

  // Start editing a comment
  const startEditingComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // Save edited comment
  const saveEditedComment = async (commentId) => {
    try {
      setSubmittingComment(true);
      const response = await commentsAPI.updateComment(commentId, { content: editContent });
      
      if (response.data && response.data.comment) {
        setComments(comments.map(comment => 
          comment._id === commentId ? {...comment, content: editContent} : comment
        ));
        toast.success('Comment updated successfully!');
      }
      
      setEditingComment(null);
      setEditContent('');
      setSubmittingComment(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment. Please try again.');
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await commentsAPI.deleteComment(commentId);
      
      if (response.data && response.data.success) {
        // Remove comment from UI
        setComments(comments.filter(comment => comment._id !== commentId));
        
        // Update blog comment count
        if (blog) {
          setBlog({
            ...blog,
            commentsCount: Math.max(0, blog.commentsCount - 1)
          });
        }
        
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      // Show more specific error message if available
      const errorMessage = error.response?.data?.message || 'Failed to delete comment. Please try again.';
      toast.error(errorMessage);
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
          <div className="flex items-center">
            <FiUser className="mr-2" />
            <span>{blog.author?.username || 'Unknown author'}</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>

        {/* Edit & Delete Buttons */}
        {canEdit && (
          <div className="flex gap-4 mb-6">
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
          </div>
        )}

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
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Comments</h3>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-10">
            <div className="mb-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className={`px-6 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 ${
                  (submittingComment || !commentText.trim()) &&
                  'opacity-50 cursor-not-allowed'
                }`}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mb-10">
            <p className="text-gray-600">
              Please{' '}
              <Link to="/login" className="text-indigo-700 hover:underline">
                log in
              </Link>{' '}
              to comment.
            </p>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => {
              // Get profile picture URL from user object
              const profileUrl = comment.user?.profilePicture || comment.user?.picture;
              const userInitial = comment.user?.username?.charAt(0) || 'U';
              const isAuthor = user && comment.user && user._id === comment.user._id;
              const isAdmin = user && user.role === 'admin';
              
              return (
                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={comment.user?.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite fallback loop
                              // Replace with user initial
                              const parent = e.target.parentNode;
                              if (parent) {
                                parent.innerHTML = `<span>${userInitial}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                      <span className="font-medium">{comment.user?.username || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        {formatDate(comment.createdAt)}
                      </span>
                      
                      {/* Action buttons (only for author or admin) */}
                      {(isAuthor || isAdmin) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingComment(comment)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit comment"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete comment"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Comment content */}
                  {editingComment === comment._id ? (
                    <div>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                        rows="3"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEditingComment}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditedComment(comment._id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          disabled={submittingComment || !editContent.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">{comment.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage; 