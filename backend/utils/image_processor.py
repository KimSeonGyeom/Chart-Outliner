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

def process_template_image(template_filename, processing_params=None):
    """
    Process a template image file with Canny edge detection and additional processing techniques
    
    Args:
        template_filename: Filename of the template image in the public/templates directory
        processing_params: Optional dict with parameters for different processing techniques
            - threshold: Dict with lower and upper thresholds for Canny
            - sparsification: Dict with drop rate
            - blur: Dict with kernel size and sigma
            - contour: Dict with epsilon parameter for approximation
    
    Returns:
        dict: Results of image processing with various techniques
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
    
    # Default processing: detect edges using standard Canny
    edges = cv2.Canny(blurred, 50, 150)
    
    # Initialize result dictionary
    result = {
        "grayscale_image": None,
        "edge_image": None,
        "dimensions": {
            "width": img.shape[1],
            "height": img.shape[0],
            "channels": img.shape[2] if len(img.shape) > 2 else 1
        },
        "processed_edges": {}
    }
    
    # If processing parameters are provided, apply different techniques
    if processing_params:
        # 1. Threshold adjustment for Canny
        if 'threshold' in processing_params:
            params = processing_params['threshold']
            lower = params.get('lower', 50)
            upper = params.get('upper', 150)
            threshold_edges = cv2.Canny(blurred, lower, upper)
            _, buffer = cv2.imencode('.png', threshold_edges)
            result["processed_edges"]["threshold"] = base64.b64encode(buffer).decode('utf-8')
        
        # 2. Edge sparsification
        if 'sparsification' in processing_params:
            params = processing_params['sparsification']
            drop_rate = params.get('drop_rate', 0.3)
            
            # Create random mask with specified drop rate
            mask = np.random.rand(*edges.shape) > drop_rate
            sparse_edges = np.where(mask, edges, 0).astype(np.uint8)
            
            _, buffer = cv2.imencode('.png', sparse_edges)
            result["processed_edges"]["sparsification"] = base64.b64encode(buffer).decode('utf-8')
        
        # 3. Pre-smoothing with Gaussian blur
        if 'blur' in processing_params:
            params = processing_params['blur']
            kernel_size = params.get('kernel_size', 5)
            sigma = params.get('sigma', 1.0)
            
            # Ensure kernel size is odd
            if kernel_size % 2 == 0:
                kernel_size += 1
            
            # Apply Gaussian blur and then Canny
            custom_blurred = cv2.GaussianBlur(gray_img, (kernel_size, kernel_size), sigma)
            blur_edges = cv2.Canny(custom_blurred, 100, 200)
            
            _, buffer = cv2.imencode('.png', blur_edges)
            result["processed_edges"]["blur"] = base64.b64encode(buffer).decode('utf-8')
        
        # 4. Contour simplification
        if 'contour' in processing_params:
            params = processing_params['contour']
            epsilon_factor = params.get('epsilon_factor', 0.02)
            
            # Find contours from edge image
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Create a blank image for drawing simplified contours
            contour_img = np.zeros_like(edges)
            
            # Simplify and draw each contour
            for contour in contours:
                # Calculate epsilon based on contour perimeter
                epsilon = epsilon_factor * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                cv2.drawContours(contour_img, [approx], 0, 255, 1)
            
            _, buffer = cv2.imencode('.png', contour_img)
            result["processed_edges"]["contour"] = base64.b64encode(buffer).decode('utf-8')
    
    # Convert base images to base64
    _, gray_buffer = cv2.imencode('.png', gray_img)
    result["grayscale_image"] = base64.b64encode(gray_buffer).decode('utf-8')
    
    _, edge_buffer = cv2.imencode('.png', edges)
    result["edge_image"] = base64.b64encode(edge_buffer).decode('utf-8')
    
    return result