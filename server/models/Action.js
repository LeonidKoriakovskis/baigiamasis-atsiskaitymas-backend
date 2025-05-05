const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['Task', 'Project', 'Comment', 'User'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;