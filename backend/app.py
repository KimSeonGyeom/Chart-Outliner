import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import image processing utilities
from utils.image_processor import process_image, process_chart_image
# Import similarity utility
from utils.similarity import find_most_similar_template

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Flask server is running"}), 200

@app.route('/api/process-image', methods=['POST'])
def handle_process_image():
    """Process an uploaded image"""
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    try:
        # Process the image using OpenCV
        result = process_image(file)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-chart', methods=['POST'])
def handle_process_chart():
    """Process a chart image with Canny edge detection and denoising"""
    try:
        # Get base64 chart image data from request
        data = request.get_json()
        if not data or 'imageData' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Process the chart image
        result = process_chart_image(data['imageData'])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/find-similar-template', methods=['POST'])
def handle_find_similar_template():
    """Find the most similar template based on metaphor text"""
    try:
        data = request.get_json()
        if not data or 'metaphorText' not in data:
            return jsonify({"error": "No metaphor text provided"}), 400
        
        # Path to templates directory - adjust as needed based on your project structure
        templates_dir = '../public/templates'
        
        # Find the most similar template
        result = find_most_similar_template(data['metaphorText'], templates_dir)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug) 