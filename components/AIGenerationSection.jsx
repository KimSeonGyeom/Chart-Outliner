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
  const dataSubject = chartData.subject;
  
  // AI states from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isGenerating = useAiStore(state => state.isGenerating);
  const visualInterpretation = useDataStore(state => state.visualInterpretation);
  const selectedTemplate = useAiStore(state => state.selectedTemplate);
  const isLoading = useAiStore(state => state.isLoading);
  const edgeImageData = useAiStore(state => state.edgeImageData);
  const processedEdgeImages = useAiStore(state => state.edgeImageData_Processed);

  // AI actions from aiStore
  const setMetaphors = useAiStore(state => state.setMetaphors);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  const setVisualInterpretation = useDataStore(state => state.setVisualInterpretation);
  const setIsLoading = useAiStore(state => state.setIsLoading);
  const setEdgeImageData = useAiStore(state => state.setEdgeImageData);
  const setProcessedEdgeImage = useAiStore(state => state.setProcessedEdgeImage);
  const setAllProcessedEdgeImages = useAiStore(state => state.setAllProcessedEdgeImages);

  // Processing parameters state
  const [processingParams, setProcessingParams] = React.useState({
    // threshold: { lower: 50, upper: 150 },
    sparsification: { drop_rate: 0.7 },
    blur: { kernel_size: 10, sigma: 2.0 },
    contour: { epsilon_factor: 0.03 }
  });

  // Selected processing technique
  const [selectedTechnique, setSelectedTechnique] = React.useState(null);

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

  // Function to process template image with selected processing technique
  const processTemplateWithTechnique = async () => {
    if (!selectedTemplate) return;
    
    try {
      setIsLoading(true);
      
      // Create processing parameters object with only the selected technique
      const selectedParams = {};
      if (selectedTechnique) {
        selectedParams[selectedTechnique] = processingParams[selectedTechnique];
      }
      
      // Process the template image with the selected technique
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          template_filename: selectedTemplate.filename,
          processing_params: selectedParams
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
      
      // Update processed edge images
      if (data.processed_edges && selectedTechnique) {
        setProcessedEdgeImage(selectedTechnique, data.processed_edges[selectedTechnique]);
      }
    } catch (error) {
      console.error('Error processing template image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process template image with all techniques at once
  const processTemplateWithAllTechniques = async () => {
    if (!selectedTemplate) return;
    
    try {
      setIsLoading(true);
      
      // Process the template image with all techniques
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          template_filename: selectedTemplate.filename,
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

  // Handle parameter change
  const handleParamChange = (technique, param, value) => {
    setProcessingParams(prev => ({
      ...prev,
      [technique]: {
        ...prev[technique],
        [param]: value
      }
    }));
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
            
            {/* Edge Processing Controls */}
            <div className="edge-processing-controls" style={{ marginTop: '20px' }}>
              <h3>Edge Processing Techniques</h3>
              
              <div className="technique-selector" style={{ marginBottom: '15px' }}>
                <label>Select Technique: </label>
                <select 
                  value={selectedTechnique || ''} 
                  onChange={(e) => setSelectedTechnique(e.target.value || null)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="">None</option>
                  {/* <option value="threshold">Canny Threshold</option> */}
                  <option value="sparsification">Edge Sparsification</option>
                  <option value="blur">Gaussian Blur</option>
                  <option value="contour">Contour Simplification</option>
                </select>
                
                <button 
                  onClick={processTemplateWithTechnique}
                  disabled={!selectedTechnique || isLoading}
                  style={{ marginLeft: '10px', padding: '5px 10px' }}
                >
                  Apply Selected Technique
                </button>
                
                <button 
                  onClick={processTemplateWithAllTechniques}
                  disabled={isLoading}
                  style={{ marginLeft: '10px', padding: '5px 10px' }}
                >
                  Apply All Techniques
                </button>
              </div>
              
              {/* Parameters for each technique */}
              {selectedTechnique === 'sparsification' && (
                <div className="technique-params">
                  <h4>Edge Sparsification</h4>
                  <div>
                    <label>Drop Rate: {processingParams.sparsification.drop_rate.toFixed(2)}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="0.9" 
                      step="0.05"
                      value={processingParams.sparsification.drop_rate} 
                      onChange={(e) => handleParamChange('sparsification', 'drop_rate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
              
              {selectedTechnique === 'blur' && (
                <div className="technique-params">
                  <h4>Gaussian Blur</h4>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div>
                      <label>Kernel Size: {processingParams.blur.kernel_size}</label>
                      <input 
                        type="range" 
                        min="3" 
                        max="15" 
                        step="1"
                        value={processingParams.blur.kernel_size} 
                        onChange={(e) => handleParamChange('blur', 'kernel_size', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label>Sigma: {processingParams.blur.sigma.toFixed(1)}</label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.5"
                        value={processingParams.blur.sigma} 
                        onChange={(e) => handleParamChange('blur', 'sigma', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTechnique === 'contour' && (
                <div className="technique-params">
                  <h4>Contour Simplification</h4>
                  <div>
                    <label>Epsilon Factor: {processingParams.contour.epsilon_factor.toFixed(3)}</label>
                    <input 
                      type="range" 
                      min="0.001" 
                      max="0.1" 
                      step="0.001"
                      value={processingParams.contour.epsilon_factor} 
                      onChange={(e) => handleParamChange('contour', 'epsilon_factor', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
              
              {/* Display processed images */}
              <div className="processed-images" style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {selectedTechnique && processedEdgeImages[selectedTechnique] && (
                  <div className="image-container" style={{ flex: 1 }}>
                    <h4>{selectedTechnique.charAt(0).toUpperCase() + selectedTechnique.slice(1)}</h4>
                    <img 
                      src={`data:image/png;base64,${processedEdgeImages[selectedTechnique]}`}
                      alt={`${selectedTechnique} processing`} 
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                  </div>
                )}
                
                {!selectedTechnique && (
                  <>
                    {Object.entries(processedEdgeImages).map(([technique, imageData]) => 
                      imageData && (
                        <div className="image-container" key={technique}>
                          <h4>{technique.charAt(0).toUpperCase() + technique.slice(1)}</h4>
                          <img 
                            src={`data:image/png;base64,${imageData}`}
                            alt={`${technique} processing`} 
                            style={{ maxWidth: '100%', maxHeight: '250px' }}
                          />
                        </div>
                      )
                    )}
                  </>
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