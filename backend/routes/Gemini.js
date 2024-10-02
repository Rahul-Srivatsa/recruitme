const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer'); // For handling file uploads

const router = express.Router();

// Initialize Google Generative AI
const genai = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Your Gemini API Key from environment variables
});

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

// POST route to interact with Gemini API
router.post('/ask-gemini', async (req, res) => {
  const { transcription, resume, jobDescription } = req.body;

  try {
    // Set up the prompt for the API call to Gemini
    const prompt = `Based on the following transcription, resume, and job description, generate a follow-up question to assess the candidate's fit:
    Transcription: "${transcription}"
    Resume: "${resume}"
    Job Description: "${jobDescription}"`;

    const response = await genai.generateContent({
      model: 'gemini-1.5-flash-001',
      prompt: prompt,
    });

    res.status(200).json({ question: response }); // Send the response back
  } catch (error) {
    console.error('Error querying Gemini:', error);
    res.status(500).json({ message: 'Error communicating with Gemini API' });
  }
});

module.exports = router;
