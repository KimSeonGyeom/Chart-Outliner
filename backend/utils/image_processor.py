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
    # Read image from file stream
    img_bytes = file_stream.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
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