const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all users - all authenticated users can read
router.get('/', protect, userController.getUsers);

// Get user by ID - all authenticated users can read
router.get('/:id', protect, userController.getUserById);

// Update user - admin only
router.put('/:id', protect, userController.updateUser);

// Delete user - admin only
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;