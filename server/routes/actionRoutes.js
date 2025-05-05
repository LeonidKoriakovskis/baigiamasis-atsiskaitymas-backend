const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');
const { protect, admin } = require('../middleware/authMiddleware');


router.get('/', protect, admin, actionController.getAllActions);


router.get('/project/:projectId', protect, actionController.getProjectActions);


router.get('/me', protect, actionController.getUserActions);


router.get('/user/:userId', protect, admin, actionController.getUserActions);

module.exports = router;