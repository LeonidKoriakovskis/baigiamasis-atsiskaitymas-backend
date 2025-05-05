const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');


router.route('/project/:projectId')
  .get(protect, taskController.getTasks)
  .post(protect, taskController.createTask);


router.route('/:id')
  .get(protect, taskController.getTaskById)
  .put(protect, taskController.updateTask)
  .delete(protect, taskController.deleteTask);

module.exports = router;