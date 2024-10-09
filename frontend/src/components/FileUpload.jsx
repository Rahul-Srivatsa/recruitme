import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = ({ setResumeData }) => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const navigate = useNavigate();

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

    try {
      const res = await axios.post('http://localhost:5000/api/resume', formData);
      setResumeData(res.data); 
      console.log(res.data); // Send resume text and JD to parent component
      navigate('/transcription');  // Navigate to the TranscriptHandler page after successful upload
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  return (
    <form onSubmit={handleResumeUpload}>
      <input type="file" onChange={(e) => setResume(e.target.files[0])} required />
      <textarea
        placeholder="Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        required
      />
      <button type="submit">Upload Resume & JD</button>
    </form>
  );
};

export default FileUpload;
