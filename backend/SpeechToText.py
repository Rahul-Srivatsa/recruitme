import speech_recognition as sr
import pyttsx3 

# Initialize the recognizer 
r = sr.Recognizer() 

# Function to convert text to speech
def SpeakText(command):
    # Initialize the engine
    engine = pyttsx3.init()
    engine.say(command) 
    engine.runAndWait()

# Loop infinitely for user to speak
while True:    
    # Exception handling to handle exceptions at runtime
    try:
        # Use the microphone as the source for input
        with sr.Microphone() as source:
            # Wait for a second to let the recognizer adjust the energy threshold based on surrounding noise level 
            r.adjust_for_ambient_noise(source, duration=0.1)
            
            # Listens for the user's input 
            print("Listening...")
            audio = r.listen(source)
            
            # Using Google to recognize audio
            MyText = r.recognize_google(audio)
            MyText = MyText.lower()
            type(MyText)

            print("Did you say: ", MyText)
            SpeakText(MyText)
            
            # Check if the user said "stop"
            if "stop" == MyText:
                print("Stopping the listener.")
                break  # Exit the loop and stop listening
            
    except sr.RequestError as e:
        print("Could not request results; {0}".format(e))
        
    except sr.UnknownValueError:
        print("Unknown error occurred")
