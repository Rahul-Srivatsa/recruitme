import React, { useState, useCallback } from "react";

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const sendAudioChunk = useCallback(async (chunk) => {
        const formData = new FormData();
        const blob = new Blob([chunk], { type: 'audio/webm' }); // Send single chunk
        formData.append('audio', blob, 'audio_chunk.webm');

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Transcription:', data.transcription);
        } catch (error) {
            console.error('Error sending audio chunk:', error);
        }
    }, []);

    const handleStartRecording = async () => {
        if (navigator.mediaDevices) {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100, // 44.1kHz sample rate (CD quality)
                    channelCount: 1,   // Mono audio to reduce data size
                }
            });
            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
                audioBitsPerSecond: 64000, // Reduce bitrate if needed
            });

            setMediaRecorder(recorder);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks(prev => [...prev, event.data]);
                }
            };

            recorder.start(); // Start recording
            setIsRecording(true);
        } else {
            console.error("Media devices not supported");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop(); // Stop recording
            setIsRecording(false);

            // Send the last audio chunk immediately
            if (audioChunks.length > 0) {
                const lastChunk = audioChunks.pop(); // Get the last chunk
                sendAudioChunk(lastChunk); // Send it for transcription
            }
        }
    };

    return (
        <div>
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
        </div>
    );
};

export default AudioRecorder;
