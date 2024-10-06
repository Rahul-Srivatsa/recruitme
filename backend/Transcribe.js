const express = require('express');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'temp/' }); // Save files in temp folder

// Route to handle audio file upload and transcription
app.post('/transcribe', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const audioPath = req.file.path;
    console.log('Audio file uploaded:', audioPath);

    // Run the Python transcription script
    exec(`python3 transcription.py "${audioPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: 'Transcription failed' });
        }

        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }

        // Send the transcription result back to the frontend
        res.json({ transcription: stdout.trim() });

        // Optionally delete the temporary audio file after processing
        fs.unlink(audioPath, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
