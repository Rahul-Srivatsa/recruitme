const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const poppler = require('pdf-poppler');
const Tesseract = require('tesseract.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/resume', upload.single('resume'), async (req, res) => {
  const { jobDescription } = req.body;
  const resumeFile = req.file;

  if (!resumeFile) {
    return res.status(400).json({ message: 'No resume file uploaded.' });
  }

  try {
    const resumePath = resumeFile.path;

    console.log('Using OCR for extraction...');
    
    // Convert PDF to PNG images using pdf-poppler
    const pdfOutputDir = path.join(__dirname, 'temp_images');
    if (!fs.existsSync(pdfOutputDir)) {
      fs.mkdirSync(pdfOutputDir);
    }

    const options = {
      format: 'png',  // Convert PDF pages to PNG format
      out_dir: pdfOutputDir,  // Output folder
      out_prefix: path.basename(resumePath, path.extname(resumePath)),  // Output file prefix
      page: null,  // Convert all pages
    };

    // Execute PDF to image conversion
    await poppler.convert(resumePath, options);
    const firstImage = path.join(pdfOutputDir, `${options.out_prefix}-1.png`);  // Assuming we process only the first page

    // Run OCR on the first image
    const ocrResult = await Tesseract.recognize(firstImage, 'eng');

    // Clean up: remove the temporary image and the PDF file
    fs.unlinkSync(resumePath);
    fs.unlinkSync(firstImage);
    console.log(ocrResult.data.text);
    return res.status(200).json({ resume: ocrResult.data.text, jobDescription });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ message: 'Error processing resume or job description.' });
  }
});

module.exports = router;
