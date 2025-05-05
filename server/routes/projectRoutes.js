const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Get all projects & Create a new project
router.route('/')
  .get(protect, projectController.getProjects)
  .post(protect, projectController.createProject);

// Get, update and delete project by ID
router.route('/:id')
  .get(protect, projectController.getProjectById)
  .put(protect, projectController.updateProject)
  .delete(protect, projectController.deleteProject);

module.exports = router;