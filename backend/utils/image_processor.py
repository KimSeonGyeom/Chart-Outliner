import cv2
import numpy as np
from PIL import Image
import io
import base64
import os

def resize_to_height(img, target_height=512):
    """
    Resize an image to have the specified height while maintaining aspect ratio
    
    Args:
        img: The input image (OpenCV format)
        target_height: The desired height (default: 512)
    
    Returns:
        The resized image
    """
    h, w = img.shape[:2]
    aspect_ratio = w / h
    new_width = int(target_height * aspect_ratio)
    return cv2.resize(img, (new_width, target_height), interpolation=cv2.INTER_AREA)

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
    
    # Resize to target height
    img = resize_to_height(img, 512)
    
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
        # Resize to target height
        img = resize_to_height(img, 512)
    except Exception as e:
        raise ValueError(f"Failed to read image: {template_path}. Error: {str(e)}")
    
    # Convert to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise (optional step for better edge detection)
    blurred = cv2.GaussianBlur(gray_img, (5, 5), 0)
    
    # Default processing: detect edges using standard Canny
    edges = cv2.Canny(blurred, 50, 150)
    
    # Get the top 30% of the edge image
    height = edges.shape[0]
    top_height = int(height * 0.3)
    bottom_start = int(height * 0.7)
    
    top_edges = edges[:top_height, :]
    bottom_edges = edges[bottom_start:, :]
    
    # Initialize result dictionary
    result = {
        "original_image": None,
        "grayscale_image": None,
        "edge_image": None,
        "top_edge_image": None,
        "bottom_edge_image": None,
        "dimensions": {
            "width": img.shape[1],
            "height": img.shape[0],
            "channels": img.shape[2] if len(img.shape) > 2 else 1
        },
        "processed_edges": {}
    }
    
    # If processing parameters are provided, apply different techniques
    if processing_params:
        # 1. Edge sparsification
        if 'sparsification' in processing_params:
            params = processing_params['sparsification']
            drop_rate = params.get('drop_rate', 0.3)
            
            # Create random mask with specified drop rate
            mask = np.random.rand(*edges.shape) > drop_rate
            sparse_edges = np.where(mask, edges, 0).astype(np.uint8)
            
            # Get top and bottom sections
            sparse_top = sparse_edges[:top_height, :]
            sparse_bottom = sparse_edges[bottom_start:, :]
            
            # Encode all versions
            _, buffer = cv2.imencode('.png', sparse_edges)
            result["processed_edges"]["sparsification"] = base64.b64encode(buffer).decode('utf-8')
            
            _, top_buffer = cv2.imencode('.png', sparse_top)
            result["processed_edges"]["sparsification_top"] = base64.b64encode(top_buffer).decode('utf-8')
            
            _, bottom_buffer = cv2.imencode('.png', sparse_bottom)
            result["processed_edges"]["sparsification_bottom"] = base64.b64encode(bottom_buffer).decode('utf-8')
        
        # 2. Pre-smoothing with Gaussian blur
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
            
            # Get top and bottom sections
            blur_top = blur_edges[:top_height, :]
            blur_bottom = blur_edges[bottom_start:, :]
            
            # Encode all versions
            _, buffer = cv2.imencode('.png', blur_edges)
            result["processed_edges"]["blur"] = base64.b64encode(buffer).decode('utf-8')
            
            _, top_buffer = cv2.imencode('.png', blur_top)
            result["processed_edges"]["blur_top"] = base64.b64encode(top_buffer).decode('utf-8')
            
            _, bottom_buffer = cv2.imencode('.png', blur_bottom)
            result["processed_edges"]["blur_bottom"] = base64.b64encode(bottom_buffer).decode('utf-8')
    
    # Convert original image to base64
    _, original_buffer = cv2.imencode('.png', img)
    result["original_image"] = base64.b64encode(original_buffer).decode('utf-8')
    
    # Convert grayscale image to base64
    _, gray_buffer = cv2.imencode('.png', gray_img)
    result["grayscale_image"] = base64.b64encode(gray_buffer).decode('utf-8')
    
    # Convert edge image to base64
    _, edge_buffer = cv2.imencode('.png', edges)
    result["edge_image"] = base64.b64encode(edge_buffer).decode('utf-8')
    
    # Convert top and bottom edge sections to base64
    _, top_buffer = cv2.imencode('.png', top_edges)
    result["top_edge_image"] = base64.b64encode(top_buffer).decode('utf-8')
    
    _, bottom_buffer = cv2.imencode('.png', bottom_edges)
    result["bottom_edge_image"] = base64.b64encode(bottom_buffer).decode('utf-8')
    
    return result