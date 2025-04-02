"use client";

import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { useDataStore } from '../store/dataStore.js';
import { useAiStore, METAPHOR_PROPS, AI_CONSTANTS } from '../store/aiStore.js';
import { downloadChart } from '../controls/index.js';
import React from 'react';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const chartData = useDataStore(state => state.chartData);
  const dataSubject = chartData.subject;
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
  // AI states from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isGenerating = useAiStore(state => state.isGenerating);
  const visualInterpretation = useDataStore(state => state.visualInterpretation);

  // AI actions from aiStore
  const setMetaphors = useAiStore(state => state.setMetaphors);
  const setIsGenerating = useAiStore(state => state.setIsGenerating);
  const setChartImageData = useAiStore(state => state.setChartImageData);
  const setVisualInterpretation = useDataStore(state => state.setVisualInterpretation);

  // Add state for selected template
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

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
        setMetaphors(data.content.metaphors);

      } catch (error) {
        console.error('API error:', error);
      }
    } catch (error) {
      console.error('Error generating metaphors:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to process chart with Canny edge detection and denoising
  const processChartCannyEdges = async () => {
    try {
      setIsGenerating(true);
      
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
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle metaphor card click
  const handleMetaphorClick = async (metaphor) => {
    try {
      setIsLoading(true);
      
      // Get the metaphorical object text
      const metaphorText = metaphor["metaphorical object"];
      
      // Call the backend API to find similar template
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
      
      // Set the selected template
      setSelectedTemplate({
        filename: data.template_filename,
        name: data.template_name,
        score: data.similarity_score
      });
      
      console.log('Selected template:', data);
    } catch (error) {
      console.error('Error finding similar template:', error);
    } finally {
      setIsLoading(false);
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
              <img 
                src={`/templates/${selectedTemplate.filename}`} 
                alt={selectedTemplate.name}
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
          )}
          
          <div className="metaphors-gallery">
            {metaphors.length==0 && Array(AI_CONSTANTS.NUM_METAPHORS).fill().map((_, index) => (
              <div
                key={index}
                className="metaphor-card placeholder"
              >
                <div className="metaphor-content">
                  <div className="metaphor-text">
                    Metaphor {index + 1}: Search metaphors to see
                  </div>
                  <div className="metaphor-text">
                    Reason why this metaphor is fit for the visual interpretation(data trend): Search metaphors to see
                  </div>
                  <div className="metaphor-text">
                    Reason why this metaphor is fit for the chart's subject(not data trend): Search metaphors to see
                  </div>
                  <div className="metaphor-text">
                    Reason why this metaphor is fit for the author's intent: Search metaphors to see
                  </div>
                </div>
              </div>
            ))}
            {metaphors.length>0 && metaphors.map((metaphor, index) => (
              <div
                key={index}
                className="metaphor-card"
                onClick={() => handleMetaphorClick(metaphor)}
                style={{ cursor: 'pointer' }}
              >
                <div className="metaphor-content">
                  <div className="metaphor-text">
                    {metaphor["metaphorical object"]}
                  </div>
                  <div className="metaphor-text">
                    {metaphor["reason why this metaphor is fit for the visual interpretation(data trend)"]}
                  </div>
                  <div className="metaphor-text">
                    {metaphor["reason why this metaphor is fit for the chart's subject(not data trend)"]}
                  </div>
                  <div className="metaphor-text">
                    {metaphor["reason why this metaphor is fit for the author's intent"]}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isLoading && (
            <div className="loading-message">
              Finding the most similar template...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 