import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const CommentComponent = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await commentsAPI.getComments(blogId);
        
        if (response.data && response.data.comments) {
          setComments(response.data.comments);
        } else {
          setComments([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
        setLoading(false);
      }
    };

    fetchComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await commentsAPI.createComment(blogId, { content: newComment });
      
      if (response.data && response.data.comment) {
        setComments([response.data.comment, ...comments]);
      }
      
      setNewComment('');
      setSubmitting(false);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.deleteComment(commentId);
        setComments(comments.filter(comment => comment._id !== commentId));
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment. Please try again.');
      }
    }
  };

  const startEditingComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const saveEditedComment = async (commentId) => {
    try {
      setSubmitting(true);
      const response = await commentsAPI.updateComment(commentId, { content: editContent });
      
      if (response.data && response.data.comment) {
        setComments(comments.map(comment => 
          comment._id === commentId ? {...comment, content: editContent} : comment
        ));
      }
      
      setEditingComment(null);
      setEditContent('');
      setSubmitting(false);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-colors"
              rows="4"
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className={`px-5 py-2.5 rounded-lg shadow-sm text-white ${
                submitting || !newComment.trim()
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 transition-colors'
              }`}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-neutral-50/70 rounded-lg text-center">
          <p className="text-neutral-600">
            Please <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">login</Link> to leave a comment.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="relative flex">
            <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-primary-600 animate-spin"></div>
            <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-secondary-500 animate-spin absolute" style={{animationDelay: '-0.2s'}}></div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-neutral-50/50 rounded-lg">
          <p className="text-neutral-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => {
            // Just get the picture URL directly from the API response
            const profileUrl = comment.user?.profilePicture || comment.user?.picture;
            const username = comment.user?.username || "Anonymous";
            const firstInitial = username.charAt(0).toUpperCase();
            
            return (
              <div
                key={comment._id}
                className="p-5 rounded-lg bg-white shadow-soft border border-neutral-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {/* Very simple avatar display - either image or initial */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mr-3">
                      {profileUrl ? (
                        <img 
                          src={profileUrl} 
                          alt={username} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ""; // Clear the source
                            e.target.parentNode.innerHTML = `<span class="text-xl font-bold text-primary-600">${firstInitial}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-xl font-bold text-primary-600">{firstInitial}</span>
                      )}
                    </div>
                    
                    <div>
                      {comment.user && (
                        <Link to={`/user/${comment.user.username}`} className="text-sm font-medium text-neutral-800 hover:text-primary-700">
                          {comment.user.username}
                        </Link>
                      )}
                      <p className="text-xs text-neutral-500">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons (only for the author or admin) */}
                  {user && comment.user && (user._id === comment.user._id || user.role === 'admin') && (
                    <div className="flex space-x-2">
                      {/* Edit button */}
                      <button
                        onClick={() => startEditingComment(comment)}
                        className="text-neutral-400 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-neutral-700">
                  {editingComment === comment._id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-2 rounded border border-neutral-300 focus:outline-none focus:ring focus:border-primary-300"
                        rows="3"
                      ></textarea>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditingComment}
                          className="px-3 py-1 text-sm bg-neutral-200 text-neutral-700 hover:bg-neutral-300 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditedComment(comment._id)}
                          className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded"
                          disabled={submitting}
                        >
                          {submitting ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentComponent; 