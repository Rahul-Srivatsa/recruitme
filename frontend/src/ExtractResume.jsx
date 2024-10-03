import { useState } from 'react';
import axios from 'axios';

const ExtractResume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [response, setResponse] = useState('');
  const [question, setQuestion] = useState('');

  const handleFileUpload = (event) => {
    setResumeData(event.target.files[0]);
  };

  const handleJDChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('resume', resumeData);
    formData.append('jobDescription', jobDescription);

    try {
      // Extract resume and job description
      const result = await axios.post('http://localhost:5000/api/extract-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(result.data);
      console.log('Extracted Response:', result.data);

      // Send extracted data to Gemini
      const askGeminiResult = await axios.post('http://localhost:5000/api/ask-gemini', {
        transcription: '', // Assuming no transcription is needed for now
        resume: result.data.resume, // Send extracted resume
        jobDescription: result.data.jobDescription, // Send job description
      });

      setQuestion(askGeminiResult.data.question);
      console.log('Gemini Question:', askGeminiResult.data.question);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Upload Resume and Job Description</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Resume (PDF):</label>
          <input type="file" accept=".pdf" onChange={handleFileUpload} />
        </div>
        <div>
          <label>Job Description:</label>
          <textarea
            value={jobDescription}
            onChange={handleJDChange}
            rows="5"
            cols="50"
            placeholder="Paste the job description here"
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {response && (
        <div>
          <h2>Extracted Data:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {question && (
        <div>
          <h2>Gemini Generated Question:</h2>
          <p>{question}</p>
        </div>
      )}
    </div>
  );
};

export default ExtractResume;
