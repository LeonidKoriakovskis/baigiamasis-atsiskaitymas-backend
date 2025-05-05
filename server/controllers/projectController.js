const Project = require('../models/Project');
const Action = require('../models/Action');


exports.getProjects = async (req, res) => {
  try {
   
    let projects;
    
    if (req.user.role === 'admin') {

      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
    } else {
   
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


exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
   
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


exports.createProject = async (req, res) => {
  try {
 
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

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
   
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const { title, description, members } = req.body;
    
  
    if (title) project.title = title;
    if (description) project.description = description;
    if (members) project.members = members;
    
    const updatedProject = await project.save();
    
 
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


exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
   
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