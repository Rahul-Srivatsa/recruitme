import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TranscriptHandler = ({ resumeData }) => {
  const [transcription, setTranscription] = useState('');
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);  // Track if the microphone is active

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
    if (isListening) return;  // Prevent multiple listening

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new window.SpeechRecognition();
    
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);  // Set listening state to true when recognition starts
    };

    recognition.onend = () => {
      setIsListening(false);  // Reset listening state when recognition ends
    };

    recognition.onresult = async (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscription(currentTranscript);

      // Once the transcript is available, send it to the backend to be processed
      const audioData = await getAudioChunk(event);  // Get actual audio chunk (to send to backend)
      const transcript = await transcribeAudio(audioData);  // Send to backend for transcription
      if (transcript) {
        setTranscription(transcript);  // Update transcription state with backend result
      }
    };

    recognition.start();  // Start listening for speech
  };

  // Function to get the audio data chunk from the speech recognition event
  const getAudioChunk = async (event) => {
    // You might need to extract and send real audio chunks, depending on your implementation
    // For example, convert the current event to binary or base64 (this depends on your frontend setup)
    // Placeholder for actual audio chunk extraction logic
    return event.results[0][0].transcript;  // For now, just using the transcript as placeholder
  };

  // Function to call the /transcribe endpoint
  const transcribeAudio = async (audioData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/transcribe', {
        audioChunk: audioData,  // Send audio data here
      });
      console.log("Transcription called");
      return res.data.transcription;  // Get transcription result from backend
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
      <button onClick={startTranscription}>
        {isListening ? 'Stop Listening' : 'Start Transcription'}
      </button>
    </div>
  );
};

export default TranscriptHandler;
