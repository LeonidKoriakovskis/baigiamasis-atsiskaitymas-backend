const mongoose = require('mongoose');
const colors = require('colors');

// Configure colors
colors.enable();

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log('Connected to MongoDB'.green.bold);
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB:'.red.bold, error);
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:'.red.bold, err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected'.yellow.bold);
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination'.cyan.bold);
  process.exit(0);
});

module.exports = mongoose;