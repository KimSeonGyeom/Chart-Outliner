import os
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Initialize the model
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_template_names(templates_dir):
    """Get all PNG file names from the templates directory"""
    template_names = []
    
    if os.path.exists(templates_dir):
        for filename in os.listdir(templates_dir):
            if filename.lower().endswith('.png'):
                # Extract template name from filename (remove extension)
                template_name = os.path.splitext(filename)[0]
                # Convert underscores to spaces
                template_name = template_name.replace('_', ' ')
                template_names.append((template_name, filename))
    
    return template_names

def find_most_similar_template(metaphor_text):
    """
    Find the most similar template to the metaphor text
    
    Args:
        metaphor_text (str): The metaphor text to compare against
        
    Returns:
        dict: Contains the most similar template filename and similarity score
    """
    template_names = get_template_names("../public/templates")
    
    if not template_names:
        return {"error": "No templates found"}
    
    # Encode the metaphor text
    metaphor_embedding = model.encode([metaphor_text])
    
    # Encode all template names
    template_name_texts = [name for name, _ in template_names]
    template_embeddings = model.encode(template_name_texts)
    
    # Calculate cosine similarity
    similarities = cosine_similarity(metaphor_embedding, template_embeddings)[0]
    
    # Find the template with highest similarity
    max_index = np.argmax(similarities)
    max_similarity = similarities[max_index]
    
    _, most_similar_filename = template_names[max_index]
    
    return {
        "template_filename": most_similar_filename,
        "similarity_score": float(max_similarity),
        "template_name": template_name_texts[max_index]
    } 