const Task = require('../models/Task');
const Project = require('../models/Project');
const Action = require('../models/Action');

// Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user has access to this project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (
      req.user.role !== 'admin' && 
      project.createdBy.toString() !== req.user._id.toString() && 
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to access tasks for this project' });
    }
    
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the project this task belongs to
    const project = await Project.findById(task.projectId);
    
    if (
      req.user.role !== 'admin' && 
      project.createdBy.toString() !== req.user._id.toString() && 
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new task - admin or manager only
exports.createTask = async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized. Admin or manager access required.' });
    }
    
    const { title, description, status, assignedTo } = req.body;
    const { projectId } = req.params;
    
    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // For managers, check if they created the project
    if (
      req.user.role === 'manager' && 
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Managers can only create tasks for projects they created' });
    }
    
    const task = new Task({
      title,
      description,
      status: status || 'todo',
      assignedTo,
      projectId
    });
    
    const createdTask = await task.save();
    
    // Create action record
    await Action.create({
      action: 'Created Task',
      user: req.user._id,
      targetType: 'Task',
      targetId: createdTask._id
    });
    
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task - admin or creator (if manager)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get the project to check permissions
    const project = await Project.findById(task.projectId);
    
    // Check if user is authorized to update this task
    // Admin can update any task
    // Managers can only update tasks in projects they created
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    const { title, description, status, assignedTo } = req.body;
    
    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    
    const updatedTask = await task.save();
    
    // Create action record
    await Action.create({
      action: 'Updated Task',
      user: req.user._id,
      targetType: 'Task',
      targetId: updatedTask._id
    });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete task - admin or creator (if manager)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get the project to check permissions
    const project = await Project.findById(task.projectId);
    
    // Check if user is authorized to delete this task
    // Admin can delete any task
    // Managers can only delete tasks in projects they created
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await task.deleteOne();
    
    // Create action record
    await Action.create({
      action: 'Deleted Task',
      user: req.user._id,
      targetType: 'Task',
      targetId: req.params.id
    });
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};