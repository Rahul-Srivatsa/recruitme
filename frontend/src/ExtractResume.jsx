import { useState } from 'react';
import axios from 'axios';

const ExtractResume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [response, setResponse] = useState('');

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
      const result = await axios.post('http://localhost:5000/api/extract-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(result.data);
      console.log('Response:', result.data);
    } catch (error) {
      console.error('Error uploading resume or job description:', error);
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
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExtractResume;
