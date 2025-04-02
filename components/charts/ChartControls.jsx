"use client";

import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import ExportSection from './ExportSection.jsx';
import MetaphorGallery from './MetaphorGallery.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useDataStore } from '../store/dataStore.js';
import { useAiStore } from '../store/aiStore.js';
import React from 'react';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const chartData = useDataStore(state => state.chartData);
  const dataSubject = chartData.subject;
  
  // AI states from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isGenerating = useAiStore(state => state.isGenerating);
  const visualInterpretation = useDataStore(state => state.visualInterpretation);
  const selectedTemplate = useAiStore(state => state.selectedTemplate);
  const isLoading = useAiStore(state => state.isLoading);
  const edgeImageData = useAiStore(state => state.edgeImageData);

  // AI actions from aiStore
  const setMetaphors = useAiStore(state => state.setMetaphors);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  const setVisualInterpretation = useDataStore(state => state.setVisualInterpretation);
  const setIsLoading = useAiStore(state => state.setIsLoading);

  // Add ref for template image
  const imgRef = React.useRef(null);

  // Function to convert chart SVG to image data
  const getChartImageData = async (chartRef) => {
    if (!chartRef || !chartRef.current) {
      throw new Error('Chart reference is not available');
    }
    
    const svgElement = chartRef.current.querySelector('svg');
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
          body: JSON.stringify({ imageData, dataSubject }),
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
        const response = await fetch('/api/generate-metaphor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authorIntention, dataSubject, visualInterpretation }),
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
        
        // Get the metaphors
        const generatedMetaphors = data.content.metaphors;
        
        // Find best matching templates for all metaphors and add scores
        setIsLoading(true);
        const metaphorsWithTemplates = await Promise.all(
          generatedMetaphors.map(async (metaphor) => {
            try {
              const metaphorText = metaphor["metaphorical object"];
              const response = await fetch('http://localhost:5000/api/find-similar-template', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metaphorText }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to find similar template');
              }
              
              const data = await response.json();
              
              // Add template info to the metaphor
              return {
                ...metaphor,
                template: {
                  filename: data.template_filename,
                  name: data.template_name,
                  score: data.similarity_score
                }
              };
            } catch (error) {
              console.error('Error finding template for metaphor:', error);
              return metaphor; // Return original metaphor if match fails
            }
          })
        );
        
        // Sort metaphors by template match score (highest first)
        const sortedMetaphors = metaphorsWithTemplates
          .filter(m => m.template && m.template.score) // Only include metaphors with valid scores
          .sort((a, b) => b.template.score - a.template.score);
        
        // Add any metaphors without templates at the end
        const metaphorsWithoutTemplates = metaphorsWithTemplates.filter(m => !m.template || !m.template.score);
        const allSortedMetaphors = [...sortedMetaphors, ...metaphorsWithoutTemplates];
        
        // Update metaphors in store
        setMetaphors(allSortedMetaphors);
        
        // If we have a top match, automatically select it
        if (sortedMetaphors.length > 0) {
          const topMatch = sortedMetaphors[0];
          useAiStore.getState().setSelectedTemplate(topMatch.template);
          
          // Process the template image
          try {
            // Process the top matching template with Canny edge detection
            const processResponse = await fetch('http://localhost:5000/api/process-template', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ template_filename: topMatch.template.filename }),
            });
            
            if (processResponse.ok) {
              const processData = await processResponse.json();
              if (processData.edge_image) {
                useAiStore.getState().setEdgeImageData(processData.edge_image);
              }
            }
          } catch (processError) {
            console.error('Error processing template image:', processError);
          }
        }
        
      } catch (error) {
        console.error('API error:', error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error generating metaphors:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="chart-section">
      <div className="section-title">Current Chart</div>
      
      {/* Export options */}
      <ExportSection chartRef={chartRef} />
      
      {/* Chart display */}
      <div className="chart-display" ref={chartRef}>
        {chartType === 'bar' ? <BarChart /> : <LineChart />}
      </div>

      {/* AI Prompt Generation */}
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
            <span className="data-value">{dataSubject || "No data subject yet"}</span>
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
              <h3>Selected Template: {selectedTemplate.name} (Score: {selectedTemplate.score.toFixed(2)})</h3>
              
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
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                  </div>
                )}
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
    </div>
  );
} 