import os
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import image processing utilities
from utils.image_processor import process_image, process_template_image
# Import similarity utility
from utils.similarity import find_most_similar_template

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a local templates directory if it doesn't exist
def setup_templates_dir():
    """
    Create a local templates directory and try to copy templates from the Next.js public folder
    """
    # Create templates directory in the backend if it doesn't exist
    backend_templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    if not os.path.exists(backend_templates_dir):
        os.makedirs(backend_templates_dir)
        print(f"Created templates directory: {backend_templates_dir}")
    
    # Define the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Try to find the Next.js public templates directory
    potential_paths = [
        os.path.join(project_root, 'public', 'templates'),
        os.path.join('public', 'templates'),
        os.path.join('..', 'public', 'templates'),
    ]
    
    print(f"Looking for templates in the following directories:")
    for path in potential_paths:
        print(f"- {os.path.abspath(path)}")
    
    for path in potential_paths:
        if os.path.exists(path):
            print(f"Found Next.js templates at: {os.path.abspath(path)}")
            # Check and report the number of template files
            template_files = [f for f in os.listdir(path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
            print(f"Found {len(template_files)} template files")
            
            # Copy all template files to the backend templates directory
            for filename in template_files:
                src = os.path.join(path, filename)
                dst = os.path.join(backend_templates_dir, filename)
                shutil.copy2(src, dst)
                print(f"Copied template: {filename}")
            print("Template synchronization complete")
            return True
    
    print("Warning: Could not find Next.js templates directory")
    print("Will attempt to read templates directly from public/templates")
    return False

# Run setup at startup
setup_templates_dir()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Flask server is running"}), 200

@app.route('/api/process-image', methods=['POST'])
def handle_process_image():
    # get parameter of base64 image
    base64_image = request.args.get('base64_image')
    
    try:
        # Process the image using OpenCV
        result = process_image(base64_image)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/process-template', methods=['POST'])
def handle_process_template():
    """Process a template image with Canny edge detection"""
    try:
        data = request.get_json()
        if not data or 'template_filename' not in data:
            return jsonify({"error": "No template filename provided"}), 400
        
        template_filename = data['template_filename']
        print(f"Processing template: {template_filename}")
        
        # Extract processing parameters if provided
        processing_params = data.get('processing_params', None)
        
        # Process the template image with the specified processing parameters
        result = process_template_image(template_filename, processing_params)
        return jsonify(result), 200
    except FileNotFoundError as e:
        print(f"File not found error: {str(e)}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error processing template: {str(e)}")
        print(f"Traceback: {error_traceback}")
        return jsonify({"error": str(e), "traceback": error_traceback}), 500


@app.route('/api/find-similar-template', methods=['POST'])
def handle_find_similar_template():
    """Find the most similar template based on metaphor text"""
    try:
        data = request.get_json()
        if not data or 'metaphorText' not in data:
            return jsonify({"error": "No metaphor text provided"}), 400
        
        # Find the most similar template
        result = find_most_similar_template(data['metaphorText'])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug) 