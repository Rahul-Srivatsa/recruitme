const express = require('express');
const fileUpload = require('express-fileupload'); // For uploading PDF files
const pdfParse = require('pdf-parse');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Enable file upload in Express
router.use(fileUpload());

// Function to extract text from PDF
async function extractPdfText(pdfBuffer) {
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        return '';
    }
}

// Function to classify resume text into sections
function classifyResumeSections(resumeText) {
    const sections = {
        skills: /skills|technical skills/i,
        experience: /experience|work history|professional experience/i,
        education: /education|academic/i,
        projects: /projects|portfolio/i,
        achievements: /achievements|certifications|awards/i
    };

    const resumeSections = {
        skills: '',
        experience: '',
        education: '',
        projects: '',
        achievements: ''
    };

    const lines = resumeText.split('\n');
    let currentSection = null;

    for (const line of lines) {
        for (const section in sections) {
            if (sections[section].test(line)) {
                currentSection = section;
                break;
            }
        }

        if (currentSection && line.trim()) {
            resumeSections[currentSection] += `${line}\n`;
        }
    }

    return resumeSections;
}

// Function to classify JD text into responsibilities and qualifications
function classifyJobDescription(jdText) {
    const sections = {
        responsibilities: /responsibilities|you will|role entails/i,
        qualifications: /qualifications|skills required|requirements|must have/i
    };

    const jobSections = {
        responsibilities: '',
        qualifications: ''
    };

    const lines = jdText.split('\n');
    let currentSection = null;

    for (const line of lines) {
        for (const section in sections) {
            if (sections[section].test(line)) {
                currentSection = section;
                break;
            }
        }

        if (currentSection && line.trim()) {
            jobSections[currentSection] += `${line}\n`;
        }
    }

    return jobSections;
}

// Route to upload and extract resume and JD
router.post('/upload-pdfs', async (req, res) => {
    if (!req.files || !req.files.resume || !req.files.jd) {
        return res.status(400).send('Please upload both resume and job description PDFs.');
    }

    try {
        // Extract text from PDFs
        const resumeText = await extractPdfText(req.files.resume.data);
        const jdText = await extractPdfText(req.files.jd.data);

        // Classify the resume and JD
        const classifiedResume = classifyResumeSections(resumeText);
        const classifiedJD = classifyJobDescription(jdText);

        res.status(200).json({
            resume: classifiedResume,
            jobDescription: classifiedJD
        });
    } catch (error) {
        console.error("Error processing PDFs:", error);
        res.status(500).send('Error processing PDFs.');
    }
});

// Route to ask a question using Gemini API
router.post('/ask-gemini', async (req, res) => {
    const { transcription, resumeSections, jdSections } = req.body;  // Resume and JD sections from the frontend
    
    const prompt = `
    The candidate is applying for a role that requires the following qualifications: ${jdSections.qualifications}.
    The key responsibilities for this role are: ${jdSections.responsibilities}.
    The candidate's resume indicates experience in the following areas:
    - Skills: ${resumeSections.skills}
    - Experience: ${resumeSections.experience}
    - Education: ${resumeSections.education}
    - Projects: ${resumeSections.projects}
    - Achievements: ${resumeSections.achievements}
    Based on their most recent response: "${transcription}", please generate a follow-up question to assess their fit for this role and their understanding of the required skills.
    `;

    try {
        const geminiResponse = await axios.post('https://gemini-api-endpoint', {
            prompt: prompt,
            max_tokens: 200,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json(geminiResponse.data);
    } catch (error) {
        console.error('Error querying Gemini:', error);
        res.status(500).json({ message: 'Error communicating with Gemini API' });
    }
});

module.exports = router;
