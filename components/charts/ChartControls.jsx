"use client";

import React, { useRef, useState } from 'react';
import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { useDataStore } from '../store/dataStore.js';
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
  
  // OpenAI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [parsedPrompts, setParsedPrompts] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');

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
    
    // Return base64 image data
    return canvas.toDataURL('image/png', 1.0).split(',')[1];
  };

  // Handle AI prompt generation
  const generateAIPrompt = async () => {
    try {
      setIsGenerating(true);
      setApiError(''); // Clear any previous errors
      setAiPrompt(''); // Clear previous prompt
      setParsedPrompts(null); // Clear parsed prompts
      setSelectedPrompt(null); // Clear selected prompt

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

      if (data_interpretation.success) {

        // Call our API route
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData, subject, authorIntention, visualInterpretation }),
        });
        
        const data = await response.json();
        
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
            console.error('Error parsing prompt JSON:', parseError);
            setApiError(`Error parsing response: ${parseError.message}`);
          }
        } else {
          setApiError('Error generating prompt');
        }
      } else {
        setApiError('Error generating interpretation');
      }
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      setApiError(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyPrompt = () => {
    if (selectedPrompt && parsedPrompts) {
      navigator.clipboard.writeText(parsedPrompts[selectedPrompt].prompt);
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
      
      {/* AI Prompt Generation */}
      <div className="ai-section">
        <div className="ai-section-title">AI Prompt Generator for FLUX.1.dev</div>
        
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
          {isGenerating ? 'Generating...' : 'Generate Sketch Smudge Prompt'}
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
            <ul className="initial-prompt-list">
              {
                parsedPrompts["initial_metaphors"].map((value, index) => (
                  <li 
                    key={index} 
                    className={`prompt-item ${selectedPrompt === index ? 'selected' : ''}`}
                    onClick={() => setSelectedPrompt(index)}
                  >
                    Initial Metaphor-{index + 1}: {value["metaphorical object for the chart's marks"]}
                  </li>
                ))
              }
            </ul>
            <ul className="selected-prompt-list">
              {parsedPrompts["selected_metaphors"].map((value, index) => (
                <li
                  key={index}
                  className={`prompt-item ${selectedPrompt === index ? 'selected' : ''}`}
                  onClick={() => setSelectedPrompt(index)}
                >
                  <div className="prompt-content">
                    <div className="prompt-text">{value.prompt}</div>
                    <div className="prompt-detail">
                      <span className="detail-label">Selected Metaphor: {value["metaphorical object for the chart's marks"]}</span>
                    </div>
                    <div className="prompt-detail">
                      <span className="detail-label">Reason_Interpretation: {value["reason why this metaphor is fit for the visual interpretation(data trend)"]}</span>
                      <span className="detail-label">Reason_Subject: {value["reason why this metaphor is fit for the chart's subject(not data trend)"]}</span>
                      <span className="detail-label">Reason_Intent: {value["reason why this metaphor is fit for the author's intent"]}</span>
                      <span className="detail-label">Reason_Outline: {value["reason why this metaphor is fit for the marks' outline"]}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {selectedPrompt && (
              <button 
                className="ai-copy-button"
                onClick={handleCopyPrompt}
              >
                Copy to Clipboard
              </button>
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
      
      {/* Chart display */}
      <div className="chart-display" ref={chartRef}>
        {chartType === 'bar' ? <BarChart /> : <LineChart />}
      </div>
    </div>
  );
} 