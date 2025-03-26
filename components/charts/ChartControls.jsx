"use client";

import React, { useRef, useState } from 'react';
import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { 
  ControlPanel,
  downloadChart
} from '../controls';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
  // OpenAI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [intention, setIntention] = useState('');
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

  // Handle AI prompt generation
  const generateAIPrompt = async () => {
    try {
      setIsGenerating(true);
      setApiError(''); // Clear any previous errors
      setAiPrompt(''); // Clear previous prompt
      
      // Convert chart to image data URL
      if (chartRef && chartRef.current) {
        const svgElement = chartRef.current.querySelector('svg');
        if (!svgElement) {
          throw new Error('SVG element not found in chart');
        }
        
        // Get SVG dimensions
        const svgWidth = svgElement.getAttribute('width') || svgElement.clientWidth || 600;
        const svgHeight = svgElement.getAttribute('height') || svgElement.clientHeight || 400;
        
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
        
        // Get base64 image data with quality parameter
        const imageData = canvas.toDataURL('image/png', 1.0).split(',')[1];
        
        // Call our API route
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAiPrompt(data.content);
        } else {
          setApiError(data.error || 'Failed to generate prompt');
        }
      }
    } catch (error) {
      console.error('Error generating AI prompt:', error);
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
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
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
        
        {aiPrompt && (
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
        )}
      </div>
      
      {/* Chart display */}
      <div className="chart-display" ref={chartRef}>
        {chartType === 'bar' ? <BarChart /> : <LineChart />}
      </div>
    </div>
  );
} 