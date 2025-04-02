import cv2
import numpy as np
from PIL import Image
import io
import base64
import os

def process_image(file_stream):
    """
    Process an image using OpenCV
    
    Args:
        file_stream: The image file stream from request
    
    Returns:
        dict: Results of image processing
    """
    # Read image from file stream using PIL
    pil_img = Image.open(file_stream)
    # Convert PIL image to OpenCV format
    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    
    # Example processing: convert to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Example processing: detect edges using Canny
    edges = cv2.Canny(gray_img, 100, 200)
    
    # Convert processed images back to base64 for response
    _, gray_buffer = cv2.imencode('.png', gray_img)
    gray_base64 = base64.b64encode(gray_buffer).decode('utf-8')
    
    _, edge_buffer = cv2.imencode('.png', edges)
    edge_base64 = base64.b64encode(edge_buffer).decode('utf-8')
    
    # Return processing results
    return {
        "grayscale_image": gray_base64,
        "edge_image": edge_base64,
        "dimensions": {
            "width": img.shape[1],
            "height": img.shape[0],
            "channels": img.shape[2] if len(img.shape) > 2 else 1
        }
    }

def process_template_image(template_filename):
    """
    Process a template image file with Canny edge detection
    
    Args:
        template_filename: Filename of the template image in the public/templates directory
    
    Returns:
        dict: Results of image processing
    """
    # Define all possible template paths
    current_dir = os.path.dirname(os.path.abspath(__file__))  # utils directory
    backend_dir = os.path.dirname(current_dir)  # backend directory
    project_root = os.path.dirname(backend_dir)  # project root
    
    # List of potential paths to look for the template
    potential_paths = [
        os.path.join(project_root, 'public', 'templates', template_filename),
        os.path.join(backend_dir, 'templates', template_filename),
        os.path.join('public', 'templates', template_filename),
        os.path.join('..', 'public', 'templates', template_filename),
        os.path.join('..', '..', 'public', 'templates', template_filename),
    ]
    
    # Try each path
    template_path = None
    for path in potential_paths:
        if os.path.exists(path):
            template_path = path
            print(f"Found template at: {path}")
            break
    
    if not template_path:
        raise FileNotFoundError(f"Template image not found: {template_filename}. Tried paths: {potential_paths}")
    
    # Read the image using PIL instead of OpenCV
    try:
        pil_img = Image.open(template_path)
        # Convert PIL image to OpenCV format
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise ValueError(f"Failed to read image: {template_path}. Error: {str(e)}")
    
    # Convert to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise (optional step for better edge detection)
    blurred = cv2.GaussianBlur(gray_img, (5, 5), 0)
    
    # Detect edges using Canny
    edges = cv2.Canny(blurred, 50, 150)
    
    # Convert processed images back to base64 for response
    _, gray_buffer = cv2.imencode('.png', gray_img)
    gray_base64 = base64.b64encode(gray_buffer).decode('utf-8')
    
    _, edge_buffer = cv2.imencode('.png', edges)
    edge_base64 = base64.b64encode(edge_buffer).decode('utf-8')
    
    # Return processing results
    return {
        "grayscale_image": gray_base64,
        "edge_image": edge_base64,
        "dimensions": {
            "width": img.shape[1],
            "height": img.shape[0],
            "channels": img.shape[2] if len(img.shape) > 2 else 1
        }
    }