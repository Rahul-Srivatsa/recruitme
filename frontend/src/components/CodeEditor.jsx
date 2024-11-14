import React, { useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import './ComponentsCss/CodeEditor.css';
// import { runCode } from './Services/CodeEditorService';

const CodeEditorPage = () => {
    const [code, setCode] = useState('// Start coding here...');
    const [language, setLanguage] = useState('javascript'); // Default language
    const [theme, setTheme] = useState('vs-dark'); // Default theme
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [showLoader, setShowLoader] = useState(false);

    // Update code state when user types
    const handleEditorChange = (value) => {
        setCode(value);
    };

    // Handle language change
    
    const callback = ({ apiStatus, data, message }) => {
        console.log("Callback triggered:", { apiStatus, data, message });
        if (apiStatus === 'loading') {
            setShowLoader(true);
        } else if (apiStatus === 'error') {
            setShowLoader(false);
            setOutput("Something went wrong: " + message);
        } else if (apiStatus === 'success') {
            setShowLoader(false);
            setOutput(data.stdout || data.stderr || JSON.stringify(data));
        }
    };
    const languageCodes={
        cpp : 54, 
        java : 91,
        python : 92,
        javascript : 93,
    }

    // async function makeSubmission({code, language, callback, stdin}) {
    //     const url = 'https://judge0-ce.p.rapidapi.com/submissions?fields=*';
    //     const options = {
    //         method: 'POST',
    //         params: {fields: '*'},
    //         headers: {
    //             'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
    //             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    //             'Content-Type': 'application/json'
    //         },
    //         data: JSON.stringify({
    //                 language_id: 93,
    //                 source_code: 'console.log(9)',
    //             })
    //     };
    //     try {
    //         const response = await fetch(url, options);
    //         const result = await response.json();
    //         console.log("Response Data:", result); // Debugging log
    //         const token = result.data.token;
            
    //         if (token) {
    //             console.log("Submission Token:", token);
    //             return token;
    //         } else {
    //             console.error("No token received in response.");
    //         }
    
    //     } catch (error) {
    //         if (error.response) {
    //             console.error("Error Response Data:", error.response.data); // Detailed error data from API
    //             console.error("Status Code:", error.response.status);
    //         } else {
    //             console.error("Error:", error.message);
    //         }
    //         return null; // Return null to handle error in `runCode`
    //     }
    // }
    
    async function makeSubmission({ code, language, callback, stdin }) {
        const url = 'https://judge0-ce.p.rapidapi.com/submissions?fields=*'; // query params added directly in the URL
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language_id: languageCodes[language], // Example language ID for JavaScript
                source_code: code, // Your dynamic code goes here
                stdin: stdin ? stdin : '' // Optional stdin for input, can be empty
            })
        };
    
        try {
            const response = await fetch(url, options);
            
            // Check if response is OK (status 200-299)
            if (!response.ok) {
                console.error("Error:", response.statusText);
                return null;
            }
    
            const result = await response.json();
            console.log("Response Data:", result); // Debugging log
            const token = result.token; // Fixing the token extraction
            
            if (token) {
                // console.log("Submission Token:", token);
                return token;
            } else {
                console.error("No token received in response.");
            }
    
        } catch (error) {
            callback({
                apiStatus: 'error',
                message: JSON.stringify("Error in getSubmission promise not resolved: " + error)
            });
            return null; // Return null to handle error in `runCode`
        }
    }
    
    // async function getSubmission({token, callback}) {
    //     const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
    //     const options = {
    //         method: 'GET',
    //         params: {
    //             base64_encoded: 'true',
    //             fields: '*'
    //         },
    //         headers: {
    //             'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
    //             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    //         }
    //     };
    
    //     try {
    //         // Poll until the execution is complete
    //         callback({ apiStatus: 'loading' });
    //         let status = 'In Queue';
    //         let result;
    
    //         while (status === 'In Queue' || status === 'Processing') {
    //             try{
    //                 const response = await fetch(url, options);
    //                 result = await response.json().data;
    //                 status = result.status.description;
    //                 if (status === 'In Queue' || status === 'Processing') {
    //                     console.log('Waiting for execution to complete...');
    //                     await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    //                 }
    //             }
    //             catch(error){
    //                 callback({
    //                     apiStatus: 'error',
    //                     message: JSON.stringify("Error in getSubmission promise not resolved: "+error)
    //                 });
    //                 return;
    //             }
    //         }
    
    //         const output = result.stdout
    //             ? Buffer.from(result.stdout, 'base64').toString('utf-8')
    //             : result;
    
    //         return output;
    
    //     } catch (error) {
    //         callback({
    //             apiStatus: 'error',
    //             message: `Error in getSubmission: ${error.message || error}`
    //         });
    //         return null; // Return null to handle error in `runCode`
    //     }
    // }
    // async function runCode2({ code, language, callback, stdin }) {
    //     callback({ apiStatus: 'loading' }); // Signal the start of submission
    //     const token = await makeSubmission({ code, language, callback, stdin });
    
    //     if (token) {
    //         const result = await getSubmission({ token, callback });
    
    //         if (result) {
    //             console.log("Final Result:", result); // Debugging log
    //             callback({
    //                 apiStatus: 'success',
    //                 data: result
    //             });
    //         } else {
    //             // If result is null, there was an error already handled in getSubmission
    //             console.log("No result returned from getSubmission.");
    //         }
    //     } else {
    //         console.log("No token received from makeSubmission.");
    //     }
    // }

    // async function getSubmission({ token, callback }) {
    //     const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`; // Query params added directly in the URL
    //     const options = {
    //         method: 'GET',
    //         headers: {
    //             'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
    //             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    //         }
    //     };
    
    //     try {
    //         // Poll until the execution is complete
    //         callback({ apiStatus: 'loading' });
    //         let status = 'In Queue';
    //         let result;
    
    //         while (status === 'In Queue' || status === 'Processing') {
    //             try {
    //                 const response = await fetch(url, options);
    //                 result = await response.json();
    //                 status = result.data.status.description;
    
    //                 if (status === 'In Queue' || status === 'Processing') {
    //                     console.log('Waiting for execution to complete...');
    //                     await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    //                 }
    //             } catch (error) {
    //                 callback({
    //                     apiStatus: 'error',
    //                     message: JSON.stringify("Error in getSubmission promise not resolved: " + error)
    //                 });
    //                 return;
    //             }
    //         }
    
    //         const output = result.data.stdout
    //             ? Buffer.from(result.data.stdout, 'base64').toString('utf-8')
    //             : result.data;
    
    //         return output;
    
    //     } catch (error) {
    //         callback({
    //             apiStatus: 'error',
    //             message: `Error in getSubmission: ${error.message || error}`
    //         });
    //         return null; // Return null to handle error in `runCode`
    //     }
    // }

    async function getSubmission({ token, callback }) {
        const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`; // Query params added directly in the URL
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };
    
        try {
            // Poll until the execution is complete
            callback({ apiStatus: 'loading' });
            let status = 'In Queue';
            let result;
    
            while (status === 'In Queue' || status === 'Processing') {
                try {
                    const response = await fetch(url, options);
                    result = await response.json();
                    console.log("Result Data:", result); // Debugging log
                    status = result.status.description;
                    console.log("Result Data:", result.status.description); // Debugging log
                    if (status === 'In Queue' || status === 'Processing') {
                        console.log('Waiting for execution to complete...');
                        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
                    }
                } catch (error) {
                    callback({
                        apiStatus: 'error',
                        message: JSON.stringify("Error in getSubmission promise not resolved: " + error)
                    });
                    return;
                }
            }
    
            const output = result.stdout
                ? atob(result.stdout)
                : result.stderr || result;

            return output;
    
        } catch (error) {
            callback({
                apiStatus: 'error',
                message: `Error in getSubmission: ${error.message || error}`
            });
            return null; // Return null to handle error in `runCode`
        }
    }
    
    
    async function runCode2({ code, language, callback, stdin }) {
        callback({ apiStatus: 'loading' }); // Signal the start of submission
        const token = await makeSubmission({ code, language, callback, stdin });
    
        if (token) {
            const result = await getSubmission({ token, callback });
    
            if (result) {
                console.log("Final Result:", result); // Debugging log
                callback({
                    apiStatus: 'success',
                    data: result
                });
            } else {
                // If result is null, there was an error already handled in getSubmission
                console.log("No result returned from getSubmission.");
            }
        } else {
            console.log("No token received from makeSubmission.");
        }
    }
    


    // const handleRunCode = useCallback(({code, language}) => {
    //     runCode({code, language, callback, input});
    // }, [input]);


    const handleRunCode = () =>{
        runCode2({code, language, callback, input});
    }

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    // Handle theme change
    const handleThemeChange = (event) => {
        setTheme(event.target.value);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
                <select value={language} onChange={handleLanguageChange}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    {/* Add more languages as needed */}
                </select>
                <select value={theme} onChange={handleThemeChange}>
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                    {/* Add more themes as needed */}
                </select>
                <button onClick={() => handleRunCode({ code, language })} style={{ padding: '10px' }}>
                    Run Code
                </button>

            </div>
            <Editor
                height="80vh"
                language={language} // Set the language dynamically
                value={code} // Set the code value
                onChange={handleEditorChange}
                theme={theme} // Set the theme dynamically
            />
            <div style={{ padding: '10px', display:"flex", border: '1px solid #ccc', overflowY: 'auto', height: '20vh' }}>
                <h4>input:</h4>
                <pre>{input}</pre>

            </div>
            <div style={{ padding: '10px', display:"flex", border: '1px solid #ccc', overflowY: 'auto', height: '20vh' }}>
                <h4>Output:</h4>
                {output.split("\\n").map((item)=> item)}

            </div>
            {showLoader && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <div className='loader'>

                </div>
            </div>}
        </div>
    );
};

export default CodeEditorPage;
