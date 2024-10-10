const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import your route modules
const geminiRoutes = require('./routes/Gemini');
const uploadRoutes = require('./routes/Upload');
const speechRoutes = require('./routes/Speech');


// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the routes with unique paths for clarity
app.use('/api', geminiRoutes);
app.use('/api', uploadRoutes);
app.use('/api', speechRoutes);

// Basic error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
