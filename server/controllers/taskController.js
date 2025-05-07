const Task = require('../models/Task');
const Project = require('../models/Project');
const Action = require('../models/Action');


exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Allow all roles to view tasks
    // Remove the membership check for users
    // if (
    //   req.user.role !== 'admin' && 
    //   project.createdBy.toString() !== req.user._id.toString() && 
    //   !project.members.includes(req.user._id)
    // ) {
    //   return res.status(403).json({ message: 'Not authorized to access tasks for this project' });
    // }

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
  
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


exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized. Admin or manager access required.' });
    }
    const { title, description, status, assignedTo, priority, dueDate } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

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
      priority: priority || 'medium',
      dueDate,
      assignedTo,
      projectId
    });

    const createdTask = await task.save();

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


exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);

    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, assignedTo, priority, dueDate } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    const updatedTask = await task.save();

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


exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

 
    const project = await Project.findById(task.projectId);

   
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'manager' || project.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    

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