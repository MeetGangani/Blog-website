const express = require('express');
const {
  createComment, 
  getComments, 
  getComment, 
  updateComment, 
  deleteComment,
  addReply,
  updateReply,
  deleteReply,
  toggleCommentLike,
  toggleReplyLike
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Get all comments for a blog and create a comment
router.route('/')
  .get(getComments)
  .post(protect, createComment);

// Get, update, delete a comment
router.route('/:id')
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);

// Reply routes
router.route('/:id/replies')
  .post(protect, addReply);

router.route('/:id/replies/:replyId')
  .put(protect, updateReply)
  .delete(protect, deleteReply);

// Like routes
router.route('/:id/like')
  .post(protect, toggleCommentLike);

router.route('/:id/replies/:replyId/like')
  .post(protect, toggleReplyLike);

module.exports = router; 