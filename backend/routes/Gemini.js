const express = require('express');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer'); // For handling file uploads

const router = express.Router();
// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

// POST route to extract resume and job description
// Extract Resume Route
router.post('/extract-resume', upload.single('resume'), async (req, res) => {
  const { jobDescription } = req.body;
  const resumeFile = req.file;

  if (!resumeFile) {
    return res.status(400).json({ message: 'No resume file uploaded.' });
  }

  try {
    const resumeData = fs.readFileSync(resumeFile.path);
    const resumeText = await pdfParse(resumeData);
    fs.unlinkSync(resumeFile.path);

    res.status(200).json({ resume: resumeText.text, jobDescription });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ message: 'Error processing resume or job description.' });
  }
});

router.post('/ask-gemini', async (req, res) => {
  const { transcription, resume, jobDescription } = req.body;
  console.log('Transcription:', transcription);

  try {
    // Set up the prompt for the API call to Gemini
    const prompt = `Based on the following transcription, resume, and job description, generate a follow-up question to assess the candidate's fit:
    Transcription: "${transcription}"
    Resume: "${resume}"
    Job Description: "${jobDescription}"`;

    // console.log('Prompt:', prompt);

    // Log the API key to ensure it's being accessed correctly
    const apiKey = process.env.GEMINI_API_KEY;

    // Initialize the model with the API key
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Pass the prompt as part of an object to generate content
    const response = await model.generateContent(prompt);

    // Log and send the generated content
    console.log(response.response.text());
    res.status(200).json({ question: response.response.text() }); // Send the response back
  } catch (error) {
    console.error('Error querying Gemini:', error);
    res.status(500).json({ message: 'Error communicating with Gemini API' });
  }
});

module.exports = router;
