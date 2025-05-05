const Action = require('../models/Action');
const Project = require('../models/Project');
const Task = require('../models/Task');


exports.getAllActions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
    
    const actions = await Action.find()
      .populate('user', 'name email')
      .sort({ timestamp: -1 });
    
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getProjectActions = async (req, res) => {
  try {
    const { projectId } = req.params;
    
   
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
   
    if (
      req.user.role !== 'admin' && 
      project.createdBy.toString() !== req.user._id.toString() && 
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view actions for this project' });
    }
    
    
    const projectActions = await Action.find({
      targetType: 'Project',
      targetId: projectId
    }).populate('user', 'name email').sort({ timestamp: -1 });
    
   
    const tasks = await Task.find({ projectId });
    const taskIds = tasks.map(task => task._id);
    
  
    const taskActions = await Action.find({
      targetType: 'Task',
      targetId: { $in: taskIds }
    }).populate('user', 'name email').sort({ timestamp: -1 });
    
    
    const actions = [...projectActions, ...taskActions]
      .sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getUserActions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
   
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view actions for this user' });
    }
    
    const actions = await Action.find({ user: userId })
      .populate('user', 'name email')
      .sort({ timestamp: -1 });
    
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};