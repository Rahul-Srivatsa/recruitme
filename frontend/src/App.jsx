import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import TranscriptHandler from './components/TranscriptHandler';
import CodeEditor from './components/CodeEditor';

const App = () => {
  const [resumeData, setResumeData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUpload setResumeData={setResumeData} />} />
        <Route path="/transcription" element={<TranscriptHandler resumeData={resumeData} />} />
        <Route path="/code" element={<CodeEditor/>} />
      </Routes>
    </Router>
  );
};

export default App;
