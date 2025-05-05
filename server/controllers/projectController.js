const Project = require('../models/Project');
const Action = require('../models/Action');

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    // All roles can read projects
    let projects;
    
    if (req.user.role === 'admin') {
      // Admin can see all projects
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    } else {
      // Other users can only see projects they're involved with
      projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id }
        ]
      })
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    }
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user has access to this project
    if (
      req.user.role !== 'admin' && 
      project.createdBy._id.toString() !== req.user._id.toString() && 
      !project.members.some(member => member._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new project - admin or manager only
exports.createProject = async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized. Admin or manager access required.' });
    }
    
    const { title, description, members } = req.body;
    
    const project = new Project({
      title,
      description,
      createdBy: req.user._id,
      members: members || []
    });
    
    const createdProject = await project.save();
    
    // Create action record
    await Action.create({
      action: 'Created Project',
      user: req.user._id,
      targetType: 'Project',
      targetId: createdProject._id
    });
    
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project - admin or creator (if manager)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to update this project
    // Admin can update any project, managers can only update projects they created
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const { title, description, members } = req.body;
    
    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (members) project.members = members;
    
    const updatedProject = await project.save();
    
    // Create action record
    await Action.create({
      action: 'Updated Project',
      user: req.user._id,
      targetType: 'Project',
      targetId: updatedProject._id
    });
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project - admin or creator (if manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to delete this project
    // Admin can delete any project, managers can only delete projects they created
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
    // Create action record
    await Action.create({
      action: 'Deleted Project',
      user: req.user._id,
      targetType: 'Project',
      targetId: req.params.id
    });
    
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};