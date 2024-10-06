const express = require('express');
const app = express();
const geminiRoutes = require('./routes/Gemini');
const { startSpeechToTextServer } = require('./SpeechToText');

// Middleware to parse JSON bodies
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the gemini routes
app.use('/api', geminiRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
