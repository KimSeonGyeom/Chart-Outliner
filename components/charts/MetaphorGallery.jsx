"use client";

import React from 'react';
import { useAiStore, AI_CONSTANTS } from '../store/aiStore.js';
import { useSharedStore } from '../store/sharedStore.js';
import { useDataStore } from '../store/dataStore.js';

export default function MetaphorGallery() {
  // Get metaphors from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isLoading = useAiStore(state => state.isLoading);
  const setIsLoading = useAiStore(state => state.setIsLoading);
  const edgeImageData = useAiStore(state => state.edgeImageData);
  const setEdgeImageData = useAiStore(state => state.setEdgeImageData);
  const setAllProcessedEdgeImages = useAiStore(state => state.setAllProcessedEdgeImages);
  
  // Add state for expanded metaphors
  const [expandedMetaphors, setExpandedMetaphors] = React.useState({});
  
  // Toggle expansion of a metaphor
  const toggleMetaphorExpansion = (index) => {
    setExpandedMetaphors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Function to process template image with Canny edge detection
  const processTemplateImage = async (template) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template_filename: template.filename }),
      });
      
      if (!response.ok) {
        console.error('Error processing template image:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.edge_image) {
        setEdgeImageData(data.edge_image);
        
        // Reset all processed edge images when selecting a new template
        setAllProcessedEdgeImages({
          threshold: null,
          sparsification: null,
          blur: null,
          contour: null,
        });
      }
    } catch (error) {
      console.error('Error processing template image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a template
  const handleSelectTemplate = (metaphor) => {
    if (metaphor.template) {
      // Set the selected template in the store
      useAiStore.getState().setSelectedTemplate(metaphor.template);
      
      // Process the template image
      processTemplateImage(metaphor.template);
    }
  };
  
  return (
    <div className="metaphors-list">
      <h3>Generated Metaphors</h3>
      {metaphors.length > 0 && metaphors.map((metaphor, index) => (
        <div
          key={index}
          className="metaphor-item"
          onClick={() => handleSelectTemplate(metaphor)}
          style={{ cursor: 'pointer' }}
        >
          <span>
            <div className="template-score">
              {metaphor.template.score > 0.5 ? <b>{metaphor.template.score.toFixed(2)}</b> : metaphor.template.score.toFixed(2)}
            </div>
            <div className="template-score">
              {metaphor["metaphorical object"]}
            </div>
          </span>
          <img 
            src={`/templates/${metaphor.template.filename}`} 
            alt={metaphor.template.name}
            height={"80px"}
            className="template-thumbnail"
          />
        </div>
      ))}
      
      {metaphors.length === 0 && (
        <div className="no-metaphors">
          No metaphors generated yet. Click the "Generate Metaphors" button above.
        </div>
      )}
    </div>
  );
} 