import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TranscriptHandler = ({ resumeData }) => {
  const [transcription, setTranscription] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const handleSilence = () => {
      if (transcription.trim()) {
        askGemini(transcription, resumeData?.resume, resumeData?.jobDescription);
      }
    };

    const timer = setTimeout(handleSilence, 3000);  // Trigger after 3 seconds of silence
    return () => clearTimeout(timer);  // Clean up the timeout
  }, [transcription, resumeData]);

  // Function to call the /gemini endpoint
  const askGemini = async (transcription, resume, jobDescription) => {
    try {
      const res = await axios.post('http://localhost:5000/api/gemini', {
        transcription,
        resume,
        jobDescription,
      });
      setQuestion(res.data.question);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  // Function to handle real-time speech transcription
  const startTranscription = () => {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new window.SpeechRecognition();
    
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscription(currentTranscript);

      // Once the transcript is available, send it to the backend to be processed
      const audioData = 'some-audio-data';  // Replace this with actual audio data handling
      const transcript = await transcribeAudio(audioData);
      if (transcript) {
        setTranscription(transcript);
      }
    };

    recognition.start();
  };

  // Function to call the /transcribe endpoint
  const transcribeAudio = async (audioData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/transcribe', {
        audioChunk: audioData,  // Send audio data here
      });
      console.log("trascription called");
      return res.data.transcription;  // Get transcription result
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return null;
    }
  };

  if (!resumeData) {
    return <p>Please upload a resume and job description first!</p>;
  }

  return (
    <div>
      <input
        type="text"
        value={transcription}
        placeholder="Real-time transcription will appear here..."
        readOnly
      />
      {question && <p>Follow-up Question: {question}</p>}
      <button onClick={startTranscription}>Start Transcription</button>
    </div>
  );
};

export default TranscriptHandler;
