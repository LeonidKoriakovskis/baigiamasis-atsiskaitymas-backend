const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Get all comments for a task & Create a new comment
router.route('/task/:taskId')
  .get(protect, commentController.getComments)
  .post(protect, commentController.createComment);

// Update and delete comment by ID
router.route('/:id')
  .put(protect, commentController.updateComment)
  .delete(protect, commentController.deleteComment);

module.exports = router;