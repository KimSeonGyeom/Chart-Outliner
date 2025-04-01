"use client";

import React, { useRef } from 'react';
import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { useDataStore } from '../store/dataStore.js';
import { useAiStore, METAPHOR_PROPS, AI_CONSTANTS } from '../store/aiStore.js';
import { downloadChart } from '../controls/index.js';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const subject = useDataStore(state => state.chartData.subject);
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
  // AI states from aiStore
  const aiPrompt = useAiStore(state => state.aiPrompt);
  const parsedPrompts = useAiStore(state => state.parsedPrompts);
  const selectedPrompt = useAiStore(state => state.selectedPrompt);
  const isGenerating = useAiStore(state => state.isGenerating);
  const apiError = useAiStore(state => state.apiError);
  
  // AI actions from aiStore
  const setAiPrompt = useAiStore(state => state.setAiPrompt);
  const setParsedPrompts = useAiStore(state => state.setParsedPrompts);
  const setSelectedPrompt = useAiStore(state => state.setSelectedPrompt);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setApiError = useAiStore(state => state.setApiError);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  
  // Handle export button click
  const handleExport = () => {
    // Generate a filename with timestamp
    const fileName = `chart-outliner-${chartType}-chart-${Date.now()}`;
    setExportOption('exportFileName', fileName);
    
    if (chartRef && chartRef.current) {
      // Download regular chart
      downloadChart(
        chartRef, 
        fileName, 
        exportFileType
      ).catch(error => {
        console.error('Error exporting chart:', error);
      });
      
      // Download filled version with modified filename
      downloadChart(
        chartRef, 
        `${fileName}-filled`, 
        exportFileType,
        true,  // asOutlines (default)
        true   // forceFill (new parameter)
      ).catch(error => {
        console.error('Error exporting filled chart:', error);
      });
    }
  };

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
  const generateAIPrompt = async () => {
    try {
      setIsGenerating(true);
      setApiError(''); // Clear any previous errors
      setAiPrompt(''); // Clear previous prompt
      setParsedPrompts(null); // Clear parsed prompts
      setSelectedPrompt(null); // Clear selected prompt

      // Get and store chart image data
      const imageData = await getChartImageData(chartRef);

      const response_interpretation = await fetch('/api/generate-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, subject }),
      });
      const data_interpretation = await response_interpretation.json();
      const visualInterpretation = data_interpretation.content.interpretation;
      console.log('Visual Interpretation:', visualInterpretation);
      
      // Track interpretation API call
      addApiCall('interpretation');

      if (data_interpretation.success) {
        // Call our metaphors API route instead of prompt
        const response = await fetch('/api/generate-metaphors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, authorIntention, visualInterpretation }),
        });
        
        const data = await response.json();
        
        // Track metaphors API call
        addApiCall('metaphors');
        
        if (data.success) {
          setAiPrompt(JSON.stringify(data.content, null, 2)); // Display pretty JSON in textarea
          try {
            console.log('API response:', data.content);
            
            // Check if the content is already an object
            if (data.content && typeof data.content === 'object') {
              setParsedPrompts(data.content);
            } else if (typeof data.content === 'string') {
              // Try to parse it if it's a string
              const promptsObject = JSON.parse(data.content);
              setParsedPrompts(promptsObject);
            } else {
              throw new Error("Invalid response format");
            }
          } catch (parseError) {
            console.error('Error parsing metaphors JSON:', parseError);
            setApiError(`Error parsing response: ${parseError.message}`);
          }
        } else {
          setApiError('Error generating metaphors');
        }
      } else {
        setApiError('Error generating interpretation');
      }
    } catch (error) {
      console.error('Error generating AI metaphors:', error);
      setApiError(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to process chart with Canny edge detection and denoising
  const processChartCannyEdges = async () => {
    try {
      setIsGenerating(true);
      setApiError(''); // Clear any previous errors
      
      // Get chart image data
      const imageData = await getChartImageData(chartRef);
      
      // Call the Flask backend to process the chart image
      const response = await fetch('http://localhost:5000/api/process-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process chart image');
      }
      
      // Display the processed images or use them as needed
      // You can create a state to store these and display them in the UI
      console.log('Processed chart images:', data);
      
      // Optional: display the canny image in a new tab/window
      const cannyImageUrl = `data:image/png;base64,${data.canny_image}`;
      window.open(cannyImageUrl, '_blank');
      
      return data;
    } catch (error) {
      console.error('Error processing chart image:', error);
      setApiError(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="chart-section">
      <div className="section-title">Current Chart</div>
      
      {/* Export options */}
      <div className="export-section">
        <div className="radio-group">
          <input
            type="radio"
            id="png-option"
            name="export-type"
            value="png"
            checked={exportFileType === 'png'}
            onChange={() => setExportOption('exportFileType', 'png')}
          />
          <label htmlFor="png-option">PNG</label>
        </div>
        <div className="radio-group">
          <input
            type="radio" 
            id="svg-option"
            name="export-type"
            value="svg"
            checked={exportFileType === 'svg'}
            onChange={() => setExportOption('exportFileType', 'svg')}
          />
          <label htmlFor="svg-option">SVG</label>
        </div>
        <button className="export-button" onClick={handleExport}>
          Export
        </button>
        <button className="process-button" onClick={processChartCannyEdges}>
          Process Canny Edges
        </button>
      </div>
      
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
          onClick={generateAIPrompt}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Metaphors'}
        </button>
        
        {apiError && (
          <div className="api-error">
            <p>{apiError}</p>
          </div>
        )}
        
        {parsedPrompts ? (
          <div className="ai-prompt-container">
            <div className="data-subject">
              <span className="data-label">Data Subject:</span> 
              <span className="data-value">{parsedPrompts["data_subject"]}</span>
            </div>
            <div className="author-intention">
              <span className="data-label">Author's Intention:</span> 
              <span className="data-value">{parsedPrompts["author_intention"]}</span>
            </div>
            <div className="visual-interpretation">
              <span className="data-label">Visual Interpretation:</span> 
              <span className="data-value">{parsedPrompts["visual_interpretation"]}</span>
            </div>
            
            <div className="metaphors-gallery">
              {/* Placeholder or actual metaphors depending on what is available */}
              {Array(AI_CONSTANTS.NUM_METAPHORS).fill().map((_, index) => {
                const metaphor = parsedPrompts["metaphors"] && index < parsedPrompts["metaphors"].length 
                  ? parsedPrompts["metaphors"][index]
                  : null;
                
                return (
                  <div
                    key={index}
                    className={`metaphor-card ${selectedPrompt === index ? 'selected' : ''} ${!metaphor ? 'placeholder' : ''}`}
                    onClick={() => metaphor && setSelectedPrompt(index)}
                  >
                    <div className="metaphor-content">
                      <div className="metaphor-text">
                        Metaphor {index + 1}: {metaphor ? metaphor[METAPHOR_PROPS.OBJECT] : 'No metaphor generated'}
                      </div>
                      {metaphor && (
                        <div className="metaphor-detail">
                          <div className="detail-label">
                            <strong>Data Trend:</strong> {metaphor[METAPHOR_PROPS.DATA_TREND_REASON]}
                          </div>
                          <div className="detail-label">
                            <strong>Subject:</strong> {metaphor[METAPHOR_PROPS.SUBJECT_REASON]}
                          </div>
                          <div className="detail-label">
                            <strong>Author's Intent:</strong> {metaphor[METAPHOR_PROPS.INTENT_REASON]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedPrompt !== null && parsedPrompts["metaphors"] && selectedPrompt < parsedPrompts["metaphors"].length && (
              <div className="prompt-actions">
                <button 
                  className="ai-copy-button"
                  onClick={() => {
                    if (parsedPrompts && parsedPrompts.metaphors && parsedPrompts.metaphors[selectedPrompt]) {
                      navigator.clipboard.writeText(
                        parsedPrompts.metaphors[selectedPrompt][METAPHOR_PROPS.OBJECT]
                      );
                    }
                  }}
                >
                  Copy Selected Metaphor
                </button>
              </div>
            )}
          </div>
        ) : aiPrompt ? (
          <div className="ai-prompt-container">
            <textarea 
              className="ai-prompt-text" 
              value={aiPrompt} 
              readOnly
            />
            <button 
              className="ai-copy-button"
              onClick={() => {
                navigator.clipboard.writeText(aiPrompt);
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="ai-prompt-container">
            <div className="data-subject">
              <span className="data-label">Data Subject:</span> 
              <span className="data-value">{parsedPrompts ? parsedPrompts["data_subject"] : "No data subject yet"}</span>
            </div>
            <div className="author-intention">
              <span className="data-label">Author's Intention:</span> 
              <span className="data-value">{authorIntention || 'No intention set'}</span>
            </div>
            <div className="visual-interpretation">
              <span className="data-label">Visual Interpretation:</span> 
              <span className="data-value">{parsedPrompts ? parsedPrompts["visual_interpretation"] : "No interpretation yet"}</span>
            </div>
            
            <div className="metaphors-gallery">
              {Array(AI_CONSTANTS.NUM_METAPHORS).fill().map((_, index) => (
                <div
                  key={index}
                  className="metaphor-card placeholder"
                >
                  <div className="metaphor-content">
                    <div className="metaphor-text">
                      Metaphor {index + 1}: Search metaphors to see
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 