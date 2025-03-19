"use client";

import React, { useState, useRef } from 'react';
import { ChartData } from '../templates/types';
import BarChart from './BarChart';
import DiamondTemplate from '../templates/DiamondTemplate';
import TriangleTemplate from '../templates/TriangleTemplate';
import RectangleTemplate from '../templates/RectangleTemplate';
import CircleTemplate from '../templates/CircleTemplate';
import ChartGallery from '../gallery/ChartGallery';
import { SavedChartData, BarChartConfig } from '../gallery/types';
import '../../styles/components/BarChartControls.scss';

// Sample data for demonstration
const sampleData: ChartData = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 50 },
  { x: 'Mar', y: 20 },
  { x: 'Apr', y: 40 },
  { x: 'May', y: 70 },
  { x: 'Jun', y: 60 },
  { x: 'Jul', y: 80 },
];

interface BarChartControlsProps {
  data?: ChartData;
  title?: string;
}

const BarChartControls: React.FC<BarChartControlsProps> = ({
  data = sampleData,
  title = "Bar Chart Templates Demo"
}) => {
  // Chart dimensions
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  
  // Bar appearance
  const [barPadding, setBarPadding] = useState(0.2);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('rectangle');
  
  // Axis appearance
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  
  // Domain customization
  const [yDomainMin, setYDomainMin] = useState<number | undefined>(undefined);
  const [yDomainMax, setYDomainMax] = useState<number | undefined>(undefined);

  // Chart ref for saving
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [chartName, setChartName] = useState('');

  // Template mapping
  const templates: Record<string, React.ComponentType<any> | null> = {
    'none': null,
    'rectangle': RectangleTemplate,
    'circle': CircleTemplate,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };
  
  // Handle optional number input change
  const handleOptionalNumberInput = (
    setter: React.Dispatch<React.SetStateAction<number | undefined>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
    if (value === undefined || !isNaN(value)) {
      setter(value);
    }
  };
  
  // Save chart as image
  const saveChart = async () => {
    if (!chartRef.current || !chartName.trim()) return;
    
    try {
      // Convert chart to image
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current);
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create chart config
      const chartConfig: BarChartConfig = {
        width,
        height,
        barPadding,
        showXAxis,
        showYAxis,
        yDomainMin,
        yDomainMax,
        selectedTemplate
      };
      
      // Create saved chart data
      const savedChart: SavedChartData = {
        id: Date.now().toString(),
        name: chartName.trim(),
        type: 'bar',
        timestamp: Date.now(),
        imageUrl,
        config: chartConfig
      };
      
      // Get existing saved charts
      const existingCharts = localStorage.getItem('savedCharts');
      let savedCharts: SavedChartData[] = [];
      if (existingCharts) {
        savedCharts = JSON.parse(existingCharts);
      }
      
      // Add new chart and save to localStorage
      savedCharts.push(savedChart);
      localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
      
      // Reset saving state
      setIsSaving(false);
      setChartName('');
      
      alert('Chart saved successfully!');
    } catch (error) {
      console.error('Error saving chart:', error);
      alert('Failed to save chart. Please try again.');
      setIsSaving(false);
    }
  };
  
  // Load a saved chart
  const loadSavedChart = (chart: SavedChartData) => {
    if (chart.type !== 'bar') return;
    
    const config = chart.config as BarChartConfig;
    setWidth(config.width);
    setHeight(config.height);
    setBarPadding(config.barPadding);
    setShowXAxis(config.showXAxis);
    setShowYAxis(config.showYAxis);
    setYDomainMin(config.yDomainMin);
    setYDomainMax(config.yDomainMax);
    setSelectedTemplate(config.selectedTemplate);
  };

  return (
    <div className="bar-chart-controls">
      <div className="chart-container">
        <div className="chart-header">
          <h1>{title}</h1>
          <div className="chart-actions">
            <ChartGallery onLoadChart={loadSavedChart} />
            <button 
              className="save-button" 
              onClick={() => setIsSaving(true)}
            >
              Save Chart
            </button>
          </div>
        </div>
        <p>Select different templates to customize the appearance of your bar chart</p>
        
        <div ref={chartRef} className="chart-display">
          <BarChart
            data={data}
            width={width}
            height={height}
            barPadding={barPadding}
            template={templates[selectedTemplate]}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            yDomainMin={yDomainMin}
            yDomainMax={yDomainMax}
            onResize={(newWidth, newHeight) => {
              setWidth(newWidth);
              setHeight(newHeight);
            }}
          />
        </div>
        <p className="resize-hint">Drag the bottom-right corner to resize the chart.</p>
        
        {isSaving && (
          <div className="save-dialog">
            <div className="save-dialog-content">
              <h3>Save Chart</h3>
              <label>
                Chart Name:
                <input
                  type="text"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  placeholder="Enter a name for your chart"
                />
              </label>
              <div className="save-buttons">
                <button onClick={() => setIsSaving(false)}>Cancel</button>
                <button 
                  onClick={saveChart}
                  disabled={!chartName.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="controls-panel">
        <h2>Chart Controls</h2>
        
        {/* Template selection section */}
        <div className="section">
          <h3>Bar Template</h3>
          <div className="control-group">
            <label>Select Template</label>
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="none">Default Bars</option>
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
        </div>
        
        {/* Dimensions section */}
        <div className="section">
          <h3>Dimensions</h3>
          <div className="dimensions-grid">
            <div>
              <label>Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
              />
            </div>
            <div>
              <label>Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 400)}
              />
            </div>
          </div>
        </div>
        
        {/* Bar appearance section */}
        <div className="section">
          <h3>Bar Appearance</h3>
          <div className="control-group space-y">
            <div>
              <label>Bar Padding</label>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={barPadding}
                onChange={(e) => setBarPadding(parseFloat(e.target.value))}
              />
              <div className="range-value">{barPadding}</div>
            </div>
          </div>
        </div>
        
        {/* Axes & Grid section */}
        <div className="section">
          <h3>Axes & Grid</h3>
          <div className="control-group space-y">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="x-axis-checkbox"
                checked={showXAxis}
                onChange={(e) => setShowXAxis(e.target.checked)}
              />
              <label htmlFor="x-axis-checkbox">Show X Axis</label>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="y-axis-checkbox"
                checked={showYAxis}
                onChange={(e) => setShowYAxis(e.target.checked)}
              />
              <label htmlFor="y-axis-checkbox">Show Y Axis</label>
            </div>
          </div>
        </div>
        
        {/* Domain section */}
        <div className="section">
          <h3>Y Domain</h3>
          <div className="control-group space-y">
            <div>
              <label>Min Value</label>
              <input
                type="text"
                value={yDomainMin === undefined ? "Auto" : yDomainMin}
                onChange={handleOptionalNumberInput(setYDomainMin)}
                placeholder="Auto"
              />
            </div>
            
            <div>
              <label>Max Value</label>
              <input
                type="text"
                value={yDomainMax === undefined ? "Auto" : yDomainMax}
                onChange={handleOptionalNumberInput(setYDomainMax)}
                placeholder="Auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartControls;