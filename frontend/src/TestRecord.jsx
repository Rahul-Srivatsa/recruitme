// src/TestRecord.jsx
import React, { useState, useEffect } from 'react';

const TestRecord = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [output, setOutput] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [ws, setWs] = useState(null);
    const audioChunks = [];

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3000');

        websocket.onopen = () => {
            console.log('WebSocket connection established');
            setWs(websocket); // Set the WebSocket only after it's open
        };

        websocket.onmessage = (event) => {
            setOutput((prev) => `${prev}\n${event.data}`);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
            console.log('WebSocket connection closed');
            setWs(null); // Reset WebSocket on close
        };

        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, []);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(event.data); // Send audio chunk
            } else {
                console.error('WebSocket is not open. Data not sent.');
            }
        };

        recorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(audioBlob);
                } else {
                    console.error('WebSocket is not open. Final audio data not sent.');
                }
                audioChunks.length = 0;
            };
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Real-time Speech Recognition with DeepSpeech</h1>
            <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
            <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
            <div style={{ marginTop: '20px' }}>
                <h2>Transcription:</h2>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default TestRecord;
