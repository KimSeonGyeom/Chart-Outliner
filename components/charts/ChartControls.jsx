"use client";

import React, { useRef } from 'react';
import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { useDataStore } from '../store/dataStore.js';
import { useCostStore } from '../store/costStore.js';
import { useAiStore, METAPHOR_PROPS } from '../store/aiStore.js';
import { 
  ControlPanel,
  downloadChart
} from '../controls/index.js';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const subject = useDataStore(state => state.chartData.subject);
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
  // Cost tracking
  const addApiCall = useCostStore(state => state.addApiCall);
  
  // AI states from aiStore
  const aiPrompt = useAiStore(state => state.aiPrompt);
  const parsedPrompts = useAiStore(state => state.parsedPrompts);
  const selectedPrompt = useAiStore(state => state.selectedPrompt);
  const isGenerating = useAiStore(state => state.isGenerating);
  const apiError = useAiStore(state => state.apiError);
  const generatedImages = useAiStore(state => state.generatedImages);
  const isGeneratingImage = useAiStore(state => state.isGeneratingImage);
  const currentlyGeneratingIndex = useAiStore(state => state.currentlyGeneratingIndex);
  const chartImageData = useAiStore(state => state.chartImageData);
  
  // AI actions from aiStore
  const setAiPrompt = useAiStore(state => state.setAiPrompt);
  const setParsedPrompts = useAiStore(state => state.setParsedPrompts);
  const setSelectedPrompt = useAiStore(state => state.setSelectedPrompt);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setApiError = useAiStore(state => state.setApiError);
  const setGeneratedImageUrl = useAiStore(state => state.setGeneratedImageUrl);
  const setIsGeneratingImage = useAiStore(state => state.setIsGeneratingImage);
  const setCurrentlyGeneratingIndex = useAiStore(state => state.setCurrentlyGeneratingIndex);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  const resetAiStates = useAiStore(state => state.resetAiStates);
  
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

  // Function to generate image from selected prompt
  const generateImage = async (index) => {
    if (!parsedPrompts || !parsedPrompts.metaphors || !parsedPrompts.metaphors[index]) return;
    
    setCurrentlyGeneratingIndex(index);
    setIsGeneratingImage(true);
    setApiError('');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: parsedPrompts.metaphors[index][METAPHOR_PROPS.OBJECT]
        }),
      });
      
      const data = await response.json();
      
      // Track image API call
      addApiCall('image');
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      setGeneratedImageUrl(index, data.imageUrl);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsGeneratingImage(false);
      setCurrentlyGeneratingIndex(null);
    }
  };

  // Generate all images
  const generateAllImages = async () => {
    if (!parsedPrompts || !parsedPrompts.metaphors) return;
    
    setApiError('');
    
    for (let i = 0; i < parsedPrompts.metaphors.length; i++) {
      await generateImage(i);
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
            <div className="data-subject">Data Subject: {parsedPrompts["data_subject"]}</div>
            <div className="author-intention">Author's Intention: {parsedPrompts["author_intention"]}</div>
            <div className="visual-interpretation">Visual Interpretation: {parsedPrompts["visual_interpretation"]}</div>
            
            <button 
              className="generate-all-images-button"
              onClick={generateAllImages}
              disabled={isGeneratingImage}
            >
              Generate All Images
            </button>
            
            <div className="metaphors-gallery">
              {parsedPrompts["metaphors"].map((metaphor, index) => (
                <div
                  key={index}
                  className={`metaphor-card ${selectedPrompt === index ? 'selected' : ''}`}
                  onClick={() => setSelectedPrompt(index)}
                >
                  <div className="metaphor-content">
                    <div className="metaphor-text">Metaphor {index + 1}: {metaphor[METAPHOR_PROPS.OBJECT]}</div>
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
                    
                    <div className="metaphor-image-container">
                      {generatedImages[index] ? (
                        <img 
                          src={generatedImages[index]} 
                          alt={`Generated image for metaphor ${index + 1}`}
                          className="metaphor-image"
                        />
                      ) : (
                        <div className="image-placeholder">
                          <button
                            className="generate-image-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateImage(index);
                            }}
                            disabled={currentlyGeneratingIndex === index}
                          >
                            {currentlyGeneratingIndex === index ? 'Generating...' : 'Generate Image'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedPrompt !== null && (
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
        ) : null}
      </div>
    </div>
  );
} 