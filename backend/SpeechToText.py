import pyttsx3
import requests
import logging

# Set up logging
logging.basicConfig(filename='speech_to_text.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(message)s')

# Function to convert text to speech
def SpeakText(command):
    # Initialize the engine
    engine = pyttsx3.init()
    engine.say(command) 
    engine.runAndWait()

# Function to call the Gemini API and fetch a follow-up question
def fetch_gemini_response(transcription):
    url = "http://localhost:3000/api/gemini"  # Replace with your actual endpoint
    payload = {
        "input": transcription
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an error for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error("API request failed: %s", e)
        return None

# Main function to handle the conversation based on transcription
def handle_interview(transcription):
    conversation_context = {"questions": [], "responses": []}  # Keep context of conversation
    
    try:
        logging.info("Recognized text: %s", transcription)
        
        # Check if the user says "stop"
        if "stop" in transcription:
            logging.info("User said 'stop'. Stopping the interview.")
            SpeakText("Interview stopped. Thank you!")
            return  # Exit the function and stop the interview

        # Fetch a new question from the Gemini API based on the user's response
        gemini_response = fetch_gemini_response(transcription)
        if gemini_response and "question" in gemini_response:  # Check the API response
            question = gemini_response["question"]
            logging.info("Gemini API response: %s", question)
            
            # Speak the new question
            SpeakText(question)

        # Update the context with the latest question and response
        conversation_context["responses"].append(transcription)
        conversation_context["questions"].append(question if gemini_response else "No new question")

    except Exception as e:
        logging.error("Error handling interview: %s", e)
        SpeakText("Sorry, I couldn't understand that. Could you please repeat?")

# Start the interview loop
if __name__ == "__main__":
    SpeakText("Starting the interview. You can say 'stop' anytime to end.")
    # Now the backend expects the transcription from the frontend rather than recording itself.
