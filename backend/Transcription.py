from flask import Flask, request, jsonify
import whisper
import os
from flask_cors import CORS
import logging
from waitress import serve  # Import waitress

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# Load Whisper model
logging.info("Loading Whisper model...")
model = whisper.load_model("medium")  # You can adjust the model size here
logging.info("Whisper model loaded successfully.")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        logging.error("No audio file provided in the request.")
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files['audio']
    logging.info(f"Received file: {audio.filename}")

    # Save the file temporarily
    audio_path = os.path.join('temp', audio.filename)
    audio.save(audio_path)
    logging.info(f"Audio file saved at {audio_path}")

    try:
        result = model.transcribe(audio_path)
        transcription = result["text"]
        logging.info(f"Transcription: {transcription}")
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
            logging.info(f"Temporary audio file deleted: {audio_path}")

    return jsonify({"transcription": transcription}), 200


if __name__ == "__main__":
    # Ensure the 'temp' directory exists
    if not os.path.exists('temp'):
        os.makedirs('temp')
        logging.info("Created 'temp' directory for storing audio files.")
    
    logging.info("Starting server with waitress...")
    # Run the application using waitress
    serve(app, host='0.0.0.0', port=5000)
