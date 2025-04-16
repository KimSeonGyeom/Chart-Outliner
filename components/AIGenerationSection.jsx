"use client";

import React from 'react';
import MetaphorGallery from './MetaphorGallery.jsx';
import { useDataStore } from './store/dataStore.js';
import { useAiStore } from './store/aiStore.js';
import './AIGenerationSection.scss';

export default function AIGenerationSection({ chartRef }) {
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const chartData = useDataStore(state => state.chartData);
  const numberOfDataPoints = useDataStore(state => state.numDataPoints);

  // AI states from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isGenerating = useAiStore(state => state.isGenerating);
  const visualInterpretation = useDataStore(state => state.visualInterpretation);
  const selectedTemplate = useAiStore(state => state.selectedTemplate);
  const isLoading = useAiStore(state => state.isLoading);
  const edgeImageData = useAiStore(state => state.edgeImageData);
  const processedEdgeImages = useAiStore(state => state.edgeImageData_Processed);
  const selectedEdgeImageData = useAiStore(state => state.selectedEdgeImageData);
  const processingParams = useAiStore(state => state.processingParams);

  // AI actions from aiStore
  const setMetaphors = useAiStore(state => state.setMetaphors);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  const setVisualInterpretation = useDataStore(state => state.setVisualInterpretation);
  const setIsLoading = useAiStore(state => state.setIsLoading);
  const setEdgeImageData = useAiStore(state => state.setEdgeImageData);
  const setProcessedEdgeImage = useAiStore(state => state.setProcessedEdgeImage);
  const setAllProcessedEdgeImages = useAiStore(state => state.setAllProcessedEdgeImages);
  const setSelectedEdgeImageData = useAiStore(state => state.setSelectedEdgeImageData);

  // Create array of technique names for easy reference
  const edgeTechniques = ['sparsification', 'blur', 'contour'];

  // Add ref for template image
  const imgRef = React.useRef(null);

  // Function to convert chart SVG to image data
  const getChartImageData = async (chartRef) => {
    if (!chartRef || !chartRef.current) {
      throw new Error('Chart reference is not available');
    }
    
    // Use the originalSvgRef from the BarChart component
    const svgElement = chartRef.current.originalSvgRef.current;
    if (!svgElement) {
      throw new Error('SVG element not found in chart');
    }
    
    // Get SVG dimensions
    const svgWidth = svgElement.getAttribute('width') || svgElement.clientWidth || 512;
    const svgHeight = svgElement.getAttribute('height') || svgElement.clientHeight || 512;
    console.log('SVG dimensions:', svgWidth, svgHeight);
    
    // Clone SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);
    
    // Ensure SVG has proper dimensions and a white background
    svgClone.setAttribute('width', svgWidth);
    svgClone.setAttribute('height', svgHeight);
    
    // Add a white background rectangle
    const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');
    backgroundRect.setAttribute('fill', 'white');
    svgClone.insertBefore(backgroundRect, svgClone.firstChild);
    
    // Serialize the modified SVG
    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    // Create a canvas with proper dimensions
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw white background first
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a data URL from the SVG
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);
    
    // Create a new image and load the SVG into it
    const img = new Image();
    
    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = url;
    });
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    DOMURL.revokeObjectURL(url);
    
    // Get base64 image data and store it
    const base64Data = canvas.toDataURL('image/png', 1.0).split(',')[1];
    setChartImageData(base64Data);
    return base64Data;
  };

  // Function to process template with all edge techniques - this will be called automatically when template is selected
  const processTemplateWithEdgeTechniques = async (template) => {
    if (!template) return;
    
    try {
      setIsLoading(true);
      
      // Process the template image with all edge techniques
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          template_filename: template.filename,
          processing_params: processingParams
        }),
      });
      
      if (!response.ok) {
        console.error('Error processing template image:', response.status);
        return;
      }
      
      const data = await response.json();
      
      // Update edge image data
      if (data.edge_image) {
        setEdgeImageData(data.edge_image);
      }
      
      // Update all processed edge images at once
      if (data.processed_edges) {
        setAllProcessedEdgeImages(data.processed_edges);
      }
    } catch (error) {
      console.error('Error processing template image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle AI prompt generation
  const generateMetaphors = async () => {
    try {
      setIsGenerating(true);

      // Get and store chart image data
      const imageData = await getChartImageData(chartRef);

      try {
        const response_interpretation = await fetch('/api/generate-interpretation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        });
        
        if (!response_interpretation.ok) {
          const errorData = await response_interpretation.text();
          console.error('Error response from interpretation API:', errorData);
          throw new Error(`Interpretation API error: ${response_interpretation.status}`);
        }
        
        const data_interpretation = await response_interpretation.json();
        
        if (!data_interpretation.success) {
          throw new Error('Failed to generate interpretation');
        }
        
        setVisualInterpretation(data_interpretation.content.interpretation);
        console.log('Visual Interpretation:', visualInterpretation);
        
        // Call our metaphors API route
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authorIntention, subject: chartData["subject"], visualInterpretation, numberOfDataPoints }),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response from metaphors API:', errorData);
          throw new Error(`Metaphors API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error('Failed to generate metaphors');
        }

        console.log('Data:', data);
        setMetaphors(data.content);
      } catch (error) {
        console.error('Error generating metaphors:', error);
      } finally {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating metaphors:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle selecting an edge image for bar chart pattern
  const handleSelectEdgeImage = (imageData) => {
    // Toggle selection - if already selected, deselect it
    if (selectedEdgeImageData === imageData) {
      setSelectedEdgeImageData(null);
    } else {
      setSelectedEdgeImageData(imageData);
    }
  };

  return (
    <div className="ai-section">
      <div className="ai-section-title">AI Image Generator</div>
      
      {/* Intention field */}
      <div className="intention-field">
        <label htmlFor="intention-input">Your intention for image generation:</label>
        <input
          id="intention-input"
          type="text"
          value={authorIntention}
          onChange={(e) => setAuthorIntention(e.target.value)}
          placeholder="E.g., 'Artistic hand-drawn sketch', 'Minimalist line art', etc."
          className="intention-input"
        />
      </div>
      
      <button 
        className="ai-generate-button" 
        onClick={generateMetaphors}
        disabled={isGenerating}
      >
        {isGenerating ? 'Processing...' : 'Generate Metaphors with Matching Templates'}
      </button>
      
      <div className="ai-prompt-container">
        <div className="data-subject">
          <span className="data-label">Data Subject:</span> 
          <span className="data-value">{chartData["subject"] || "No data subject yet"}</span>
        </div>
        <div className="author-intention">
          <span className="data-label">Author's Intention:</span> 
          <span className="data-value">{authorIntention || 'No intention set'}</span>
        </div>
        <div className="visual-interpretation">
          <span className="data-label">Visual Interpretation:</span> 
          <span className="data-value">{visualInterpretation || "No interpretation yet"}</span>
        </div>
        
        {/* Display selected template */}
        {selectedTemplate && (
          <div className="selected-template">
            <h3>Selected Template: {selectedTemplate.name}</h3>
            
            <div className="template-images" style={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center' }}>
              <div className="image-container">
                <h4>Original Template</h4>
                <img 
                  src={`/templates/${selectedTemplate.filename}`} 
                  alt={selectedTemplate.name}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  ref={imgRef}
                />
              </div>
              
              {edgeImageData && (
                <div className="image-container">
                  <h4>Canny Edge Detection</h4>
                  <img 
                    src={`data:image/png;base64,${edgeImageData}`}
                    alt="Canny edge detection" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      cursor: 'pointer',
                      border: selectedEdgeImageData === edgeImageData ? '3px solid #4CAF50' : 'none'
                    }}
                    onClick={() => handleSelectEdgeImage(edgeImageData)}
                    title="Click to use this image in bar chart"
                  />
                </div>
              )}
            </div>
            
            {/* Edge Processing Controls - Simplified */}
            <div className="edge-processing-controls" style={{ marginTop: '20px' }}>
              <h3>Edge Processing Techniques</h3>
              
              <div style={{ marginBottom: '15px', color: '#666', fontStyle: 'italic' }}>
                Click on any edge image to use it in the bar chart
              </div>
              
              {/* Display processed images */}
              <div className="processed-images" style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                {edgeTechniques.map(technique => 
                  processedEdgeImages[technique] && (
                    <div className="image-container" key={technique} style={{ flex: 1, maxWidth: '30%' }}>
                      <h4>{technique.charAt(0).toUpperCase() + technique.slice(1)}</h4>
                      <img 
                        src={`data:image/png;base64,${processedEdgeImages[technique]}`}
                        alt={`${technique} processing`} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px',
                          cursor: 'pointer',
                          border: selectedEdgeImageData === processedEdgeImages[technique] ? '3px solid #4CAF50' : 'none'
                        }}
                        onClick={() => handleSelectEdgeImage(processedEdgeImages[technique])}
                        title="Click to use this image in bar chart"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        
        <MetaphorGallery />
        
        {isLoading && (
          <div className="loading-message">
            Processing template image...
          </div>
        )}
      </div>
    </div>
  );
} 