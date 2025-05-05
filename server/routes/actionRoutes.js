const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all actions (admin only)
router.get('/', protect, admin, actionController.getAllActions);

// Get actions for a project
router.get('/project/:projectId', protect, actionController.getProjectActions);

// Get actions for current user
router.get('/me', protect, actionController.getUserActions);

// Get actions for a specific user (admin only)
router.get('/user/:userId', protect, admin, actionController.getUserActions);

module.exports = router;