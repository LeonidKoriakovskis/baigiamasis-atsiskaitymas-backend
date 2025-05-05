const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());

require('./db');


const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Action = require('./models/Action');


app.get('/', (req, res) => {
  res.send('Project Management API is running');
});


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/actions', require('./routes/actionRoutes'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});