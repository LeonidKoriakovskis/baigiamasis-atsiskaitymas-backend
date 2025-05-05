const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Action = require('../models/Action');

// Get all comments for a task
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Check if task exists and user has access
    const task = await Task.findById(taskId);
    
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
      return res.status(403).json({ message: 'Not authorized to access comments for this task' });
    }
    
    const comments = await Comment.find({ taskId })
      .populate('author', 'name email')
      .sort({ timestamp: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new comment - admin or manager only
exports.createComment = async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized. Admin or manager access required.' });
    }
    
    const { text } = req.body;
    const { taskId } = req.params;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // For managers, check if they created the project this task belongs to
    if (req.user.role === 'manager') {
      const project = await Project.findById(task.projectId);
      if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Managers can only comment on tasks in projects they created' 
        });
      }
    }
    
    const comment = new Comment({
      text,
      author: req.user._id,
      taskId,
      timestamp: Date.now()
    });
    
    const createdComment = await comment.save();
    
    // Create action record
    await Action.create({
      action: 'Added Comment',
      user: req.user._id,
      targetType: 'Comment',
      targetId: createdComment._id
    });
    
    // Populate author information
    const populatedComment = await Comment.findById(createdComment._id)
      .populate('author', 'name email');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update comment - admin or author (if manager)
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized to update this comment
    // Admin can update any comment
    // Managers can only update their own comments
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || comment.author.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const { text } = req.body;
    comment.text = text;
    
    const updatedComment = await comment.save();
    
    // Create action record
    await Action.create({
      action: 'Updated Comment',
      user: req.user._id,
      targetType: 'Comment',
      targetId: updatedComment._id
    });
    
    // Populate author information
    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('author', 'name email');
    
    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete comment - admin or author (if manager)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized to delete this comment
    // Admin can delete any comment
    // Managers can only delete their own comments or comments on their projects
    if (req.user.role !== 'admin') {
      if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
      
      // If manager, check if they're the author or the project creator
      const task = await Task.findById(comment.taskId);
      const project = await Project.findById(task.projectId);
      
      if (
        comment.author.toString() !== req.user._id.toString() && 
        project.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
    }
    
    await comment.deleteOne();
    
    // Create action record
    await Action.create({
      action: 'Deleted Comment',
      user: req.user._id,
      targetType: 'Comment',
      targetId: req.params.id
    });
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};