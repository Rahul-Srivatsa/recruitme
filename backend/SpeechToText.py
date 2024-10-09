import speech_recognition as sr
import pyttsx3
import requests
import logging

# Initialize the recognizer 
r = sr.Recognizer() 

# Set up logging
logging.basicConfig(filename='speech_to_text.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Function to convert text to speech
def SpeakText(command):
    # Initialize the engine
    engine = pyttsx3.init()
    engine.say(command) 
    engine.runAndWait()

# Function to call the Gemini API and fetch a follow-up question
def fetch_gemini_response(transcription):
    # Define your Gemini API endpoint
    url = "http://localhost:3000/api/gemini"  # Replace with your actual endpoint
    payload = {
        "input": transcription  # Adjust according to your API's required input
    }
    
    # Make the API request
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an error for bad responses
        return response.json()  # Return the JSON response
    except requests.exceptions.RequestException as e:
        logging.error("API request failed: %s", e)
        return None

# Loop infinitely for user to speak
while True:    
    # Exception handling to handle exceptions at runtime
    try:
        # Use the microphone as the source for input
        with sr.Microphone() as source:
            # Wait for a second to let the recognizer adjust the energy threshold based on surrounding noise level 
            r.adjust_for_ambient_noise(source, duration=0.1)
            
            # Listens for the user's input 
            logging.info("Listening...")
            audio = r.listen(source)
            
            # Using Google to recognize audio
            MyText = r.recognize_google(audio)
            MyText = MyText.lower()

            logging.info("Recognized text: %s", MyText)
            
            # Fetch question from Gemini API
            gemini_response = fetch_gemini_response(MyText)
            if gemini_response and "question" in gemini_response:  # Adjust based on your API's response structure
                question = gemini_response["question"]  # Get the question text
                logging.info("Gemini API response: %s", question)
                SpeakText(question)  # Read out the follow-up question
                
            # Check if the user said "stop"
            if "stop" in MyText:
                logging.info("Stopping listener.")
                break  # Exit the loop and stop listening
            
    except sr.RequestError as e:
        logging.error("Error with speech recognition service: %s", e)
        
    except sr.UnknownValueError:
        logging.error("Speech recognition could not understand audio")
