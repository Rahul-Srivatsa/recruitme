import { useState } from 'react';
import AudioRecorder from './Recording';
import ExtractResume from './ExtractResume';  // Assuming you named the file 'Recording.jsx'

const App = () => {
    const [transcription, setTranscription] = useState(""); // State to store the transcript

    const handleTranscriptionUpdate = (newTranscription) => {
        setTranscription(prev => prev + " " + newTranscription); // Append new transcription chunks
    };

    return (
        <>
        <div className="App">
            <header className="App-header">
                <h1>Real-Time Audio Transcription</h1>
                <AudioRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />

                <h2>Transcript:</h2>
                <p>{transcription}</p>  {/* Display the transcription */}
            </header>
        </div>
        <div>
            <ExtractResume />
        </div>
        </>
    );
};

export default App;
