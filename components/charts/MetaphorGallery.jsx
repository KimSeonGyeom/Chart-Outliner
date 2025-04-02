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
      }
    } catch (error) {
      console.error('Error processing template image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle metaphor card click - select the template
  const handleMetaphorClick = async (metaphor) => {
    if (metaphor.template) {
      // Set the selected template in the store
      useAiStore.getState().setSelectedTemplate(metaphor.template);
      
      // Process the template image
      await processTemplateImage(metaphor.template);
    }
  };
  
  return (
    <div className="metaphors-list">
      {metaphors.length > 0 && metaphors.map((metaphor, index) => (
        <div
          key={index}
          className="metaphor-item"
          style={{ cursor: 'pointer' }}
        >
          <div className="metaphor-content">
            <div 
              className="metaphor-text metaphor-title"
              onClick={() => handleMetaphorClick(metaphor)}
            >
              {metaphor["metaphorical object"]}
            </div>
            
            {metaphor.template && (
              <div className="template-preview">
                <img 
                  src={`/templates/${metaphor.template.filename}`} 
                  alt={metaphor.template.name}
                  className="template-thumbnail"
                  onClick={() => handleMetaphorClick(metaphor)}
                />
                <span className="template-score">
                  {metaphor.template.score.toFixed(2)}
                </span>
              </div>
            )}
            
            {/* <div 
              className="metaphor-toggle"
              onClick={() => toggleMetaphorExpansion(index)}
            >
              {expandedMetaphors[index] ? '▼ Hide Details' : '► Show Details'}
            </div> */}
            {/*             
            {expandedMetaphors[index] && (
              <div className="metaphor-details">
                <div className="metaphor-text">
                  <strong>Visual Interpretation:</strong> {metaphor["reason why this metaphor is fit for the visual interpretation(data trend)"]}
                </div>
                <div className="metaphor-text">
                  <strong>Chart's Subject:</strong> {metaphor["reason why this metaphor is fit for the chart's subject(not data trend)"]}
                </div>
                <div className="metaphor-text">
                  <strong>Author's Intent:</strong> {metaphor["reason why this metaphor is fit for the author's intent"]}
                </div>
                
                {metaphor.template && (
                  <div className="template-info">
                    <strong>Matching Template:</strong> {metaphor.template.name}
                    <img 
                      src={`/templates/${metaphor.template.filename}`} 
                      alt={metaphor.template.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '150px', 
                        display: 'block', 
                        marginTop: '10px' 
                      }}
                    />
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>
      ))}
    </div>
  );
} 