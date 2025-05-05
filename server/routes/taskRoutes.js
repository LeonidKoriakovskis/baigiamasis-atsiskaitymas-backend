const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Get all tasks for a project & Create a new task
router.route('/project/:projectId')
  .get(protect, taskController.getTasks)
  .post(protect, taskController.createTask);

// Get, update and delete task by ID
router.route('/:id')
  .get(protect, taskController.getTaskById)
  .put(protect, taskController.updateTask)
  .delete(protect, taskController.deleteTask);

module.exports = router;