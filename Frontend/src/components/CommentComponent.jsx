import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash, FiHeart, FiMessageSquare } from 'react-icons/fi';
import ReplyComponent from './ReplyComponent';

const CommentComponent = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [likesCount, setLikesCount] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await commentsAPI.getComments(blogId);
        
        if (response.data && response.data.comments) {
          setComments(response.data.comments);
          // Initialize likes count
          const likesObj = {};
          response.data.comments.forEach(comment => {
            likesObj[comment._id] = comment.likes?.length || 0;
          });
          setLikesCount(likesObj);
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

  const handleReply = async (commentId) => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await commentsAPI.addReply(commentId, { content: replyContent });
      
      if (response.data && response.data.comment) {
        setComments(comments.map(comment => 
          comment._id === commentId ? response.data.comment : comment
        ));
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await commentsAPI.toggleCommentLike(commentId);
      if (response.data) {
        setLikesCount(prev => ({
          ...prev,
          [commentId]: response.data.likesCount
        }));
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (newSet.has(commentId)) {
            newSet.delete(commentId);
          } else {
            newSet.add(commentId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like. Please try again.');
    }
  };

  const handleReplyUpdate = (commentId, updatedComment) => {
    setComments(comments.map(comment => 
      comment._id === commentId ? updatedComment : comment
    ));
  };

  const handleReplyDelete = (commentId, replyId) => {
    setComments(comments.map(comment => {
      if (comment._id === commentId) {
        return {
          ...comment,
          replies: comment.replies.filter(reply => reply._id !== replyId)
        };
      }
      return comment;
    }));
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
            
            const isAuthor = user && comment.user && user._id === comment.user._id;
            const isAdmin = user && user.role === 'admin';

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
                        <FiEdit size={16} />
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash size={16} />
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

                {/* Reply Button */}
                {isAuthenticated && !editingComment && (
                  <div className="mt-3">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="flex items-center text-sm text-gray-500 hover:text-primary-600"
                    >
                      <FiMessageSquare className="mr-1" />
                      Reply
                    </button>
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="mt-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-colors"
                      rows="2"
                      placeholder="Write a reply..."
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(comment._id)}
                        disabled={submitting || !replyContent.trim()}
                        className={`px-3 py-1 text-sm text-white rounded ${
                          submitting || !replyContent.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {submitting ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {comment.replies.map(reply => (
                      <ReplyComponent
                        key={reply._id}
                        reply={reply}
                        commentId={comment._id}
                        onReplyUpdate={(updatedComment) => handleReplyUpdate(comment._id, updatedComment)}
                        onReplyDelete={(replyId) => handleReplyDelete(comment._id, replyId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentComponent; 