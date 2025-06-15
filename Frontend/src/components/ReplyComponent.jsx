import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash, FiHeart } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import { commentsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const ReplyComponent = ({ reply, commentId, onReplyUpdate, onReplyDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likesCount, setLikesCount] = useState(reply.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);

  const { user } = useAuth();
  const isAuthor = user && reply.user && user._id === reply.user._id;
  const isAdmin = user && user.role === 'admin';

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await commentsAPI.updateReply(commentId, reply._id, {
        content: editContent
      });

      if (response.data && response.data.comment) {
        onReplyUpdate(response.data.comment);
        setIsEditing(false);
        toast.success('Reply updated successfully!');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await commentsAPI.deleteReply(commentId, reply._id);
      onReplyDelete(reply._id);
      toast.success('Reply deleted successfully!');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      const response = await commentsAPI.toggleReplyLike(commentId, reply._id);
      if (response.data) {
        setLikesCount(response.data.likesCount);
        setIsLiked(!isLiked);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  return (
    <div className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mr-2">
            {reply.user?.profilePicture ? (
              <img
                src={reply.user.profilePicture}
                alt={reply.user.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                  e.target.parentNode.innerHTML = `<span class="text-sm font-bold text-primary-600">${reply.user.username[0]}</span>`;
                }}
              />
            ) : (
              <span className="text-sm font-bold text-primary-600">
                {reply.user?.username[0]}
              </span>
            )}
          </div>

          <div>
            <Link
              to={`/user/${reply.user?.username}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600"
            >
              {reply.user?.username}
            </Link>
            <p className="text-xs text-gray-500">
              {new Date(reply.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              } hover:text-red-500 transition-colors`}
            >
              <FiHeart className={isLiked ? 'fill-current' : ''} />
              <span>{likesCount}</span>
            </button>
          )}

          {(isAuthor || isAdmin) && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <FiTrash size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-colors"
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !editContent.trim()}
                className={`px-3 py-1 text-sm text-white rounded-lg ${
                  isSubmitting || !editContent.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export default ReplyComponent; 