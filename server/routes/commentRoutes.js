const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');


router.route('/task/:taskId')
  .get(protect, commentController.getComments)
  .post(protect, commentController.createComment);


router.route('/:id')
  .put(protect, commentController.updateComment)
  .delete(protect, commentController.deleteComment);

module.exports = router;