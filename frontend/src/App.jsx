// import { useState } from 'react';
import TestRecord from './TestRecord';  // Assuming you named the file 'Recording.jsx'
import ExtractResume from './ExtractResume';  // Assuming you named the file 'Recording.jsx'

const App = () => {
    // const [transcription, setTranscription] = useState(""); // State to store the transcript

    // const handleTranscriptionUpdate = (newTranscription) => {
    //     setTranscription(prev => prev + " " + newTranscription); // Append new transcription chunks
    // };

    return (
        <>
        <div className="App">
            <header className="App-header">
                <TestRecord/>
            </header>
        </div>
        <div>
            <ExtractResume />
        </div>
        </>
    );
};

export default App;
