const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the db.js module
require('./db');

// Import models
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Action = require('./models/Action');

// Basic route
app.get('/', (req, res) => {
  res.send('Project Management API is running');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/actions', require('./routes/actionRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});