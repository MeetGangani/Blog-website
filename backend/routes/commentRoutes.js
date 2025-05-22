const express = require('express');
const {
  createComment, 
  getComments, 
  getComment, 
  updateComment, 
  deleteComment,
  addReply
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

// Add reply to comment
router.post('/:id/replies', protect, addReply);

module.exports = router; 