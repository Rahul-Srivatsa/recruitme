// // index.js

// const express = require('express');
// const bodyParser = require('body-parser');
// const { exec } = require('child_process');
// const fs = require('fs');

// const app = express();
// app.use(bodyParser.json());

// app.post('/run-code', (req, res) => {
//   const { code, language } = req.body;

//   // Define handlers for each language
//   const handlers = {
//     javascript: () => {
//       fs.writeFileSync('temp.js', code);
//       exec('node temp.js', (error, stdout, stderr) => {
//         if (error) return res.json({ output: stderr });
//         res.json({ output: stdout });
//       });
//     },
//     python: () => {
//       fs.writeFileSync('temp.py', code);
//       exec('python3 temp.py', (error, stdout, stderr) => {
//         if (error) return res.json({ output: stderr });
//         res.json({ output: stdout });
//       });
//     },
//     java: () => {
//       fs.writeFileSync('Temp.java', code);
//       exec('javac Temp.java && java Temp', (error, stdout, stderr) => {
//         if (error) return res.json({ output: stderr });
//         res.json({ output: stdout });
//       });
//     },
//     cpp: () => {
//       fs.writeFileSync('temp.cpp', code);
//       exec('g++ temp.cpp -o temp && ./temp', (error, stdout, stderr) => {
//         if (error) return res.json({ output: stderr });
//         res.json({ output: stdout });
//       });
//     },
//   };

//   // Execute the corresponding handler based on language
//   if (handlers[language]) {
//     handlers[language]();
//   } else {
//     res.json({ output: 'Unsupported language' });
//   }
// });

// app.listen(5000, () => console.log('Server running on port 5000'));


// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/about',
//   headers: {
//     'x-rapidapi-key': 'b3e1f81a49msh3871f50401c94310p1d0981jsn85559cac8768',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// try {
// 	const response = await axios.request(options);
// 	console.log(response.data);
// } catch (error) {
// 	console.error(error);
// }


const languageCodes={
    cpp : 54, 
    java : 91,
    python : 92,
    javascript : 93,
}

async function makeSubmission({code, language, callback, stdin}) {
    const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&fields=*';
    const options = {
        method: 'POST',
        params: {fields: '*'},
        headers: {
            'x-rapidapi-key': 'b3e1f81a49msh387150401c94310p1d0981jsn85559cac8768',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            language_id: 93,
            source_code: 'console.log("Hello World")',
            //stdin: stdin
        }
    };
    try {
        const response = await fetch(url, options);
	    const result = await response.json();
        console.log("Response Data:", result); // Debugging log
        const token = result.data.token;
        
        if (token) {
            console.log("Submission Token:", token);
            return token;
        } else {
            console.error("No token received in response.");
        }

    } catch (error) {
        if (error.response) {
            console.error("Error Response Data:", error.response.data); // Detailed error data from API
            console.error("Status Code:", error.response.status);
        } else {
            console.error("Error:", error.message);
        }
        return null; // Return null to handle error in `runCode`
    }
}

async function getSubmission({token, callback}) {
    const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
    const options = {
        method: 'GET',
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
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
            try{
                const response = await fetch(url, options);
                result = await response.json().data;
                status = result.status.description;
                if (status === 'In Queue' || status === 'Processing') {
                    console.log('Waiting for execution to complete...');
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
                }
            }
            catch(error){
                callback({
                    apiStatus: 'error',
                    message: JSON.stringify("Error in getSubmission promise not resolved: "+error)
                });
                return;
            }
        }

        const output = result.stdout
            ? Buffer.from(result.stdout, 'base64').toString('utf-8')
            : result;

        return output;

    } catch (error) {
        callback({
            apiStatus: 'error',
            message: `Error in getSubmission: ${error.message || error}`
        });
        return null; // Return null to handle error in `runCode`
    }
}

export async function runCode({ code, language, callback, stdin }) {
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


