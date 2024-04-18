require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB using the connection string from the environment variables
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

module.exports = mongoose;