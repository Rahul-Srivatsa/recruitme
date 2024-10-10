const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// // Ensure the uploads directory exists
// const uploadsDir = path.join(__dirname, '..', 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Call Python script to process audio chunks
// router.post('/transcribe', (req, res) => {
//   const { audioChunk } = req.body;

//   if (!audioChunk) {
//     return res.status(400).json({ error: 'No audio chunk provided' });
//   }

//   // Save the audio chunk to the /uploads directory
//   const tempAudioPath = path.join(uploadsDir, 'temp_audio_chunk.wav');
//   fs.writeFileSync(tempAudioPath, audioChunk, 'binary');  // Ensure binary format

//   // Define the path to your Python script
//   const pythonScript = `python3 speechtotext.py ${tempAudioPath}`;  // Pass the temp audio file to the script

//   // Execute the Python script
//   exec(pythonScript, (error, stdout, stderr) => {
//     // Log the output and error streams
//     if (stdout) {
//       fs.appendFileSync('speech_to_text.log', `STDOUT: ${stdout}\n`);
//     }
//     if (stderr) {
//       fs.appendFileSync('speech_to_text.log', `STDERR: ${stderr}\n`);
//     }

//     // Clean up the temp audio file
//     fs.unlinkSync(tempAudioPath);

//     if (error) {
//       fs.appendFileSync('speech_to_text.log', `ERROR: ${error.message}\n`);
//       return res.status(500).json({ error: 'Transcription failed' });
//     }

//     res.status(200).json({ transcription: stdout.trim() });
//   });
// });

router.post('/api/transcribe', (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  console.log('Transcribed text:', transcript);

  // Here, you can process the text further if needed, or return a response
  res.json({ message: 'Text received', transcript });
});

module.exports = router;
