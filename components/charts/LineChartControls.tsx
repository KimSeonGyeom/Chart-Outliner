"use client";

import React, { useState, useRef } from 'react';
import { ChartData } from '../templates/types';
import LineChart from './LineChart';
import ChartGallery from '../gallery/ChartGallery';
import { SavedChartData, LineChartConfig } from '../gallery/types';
import '../../styles/components/LineChartControls.scss';

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

interface LineChartControlsProps {
  data?: ChartData;
  width?: number;
  height?: number;
}

const LineChartControls: React.FC<LineChartControlsProps> = ({
  data = sampleData,
  width = 800,
  height = 500,
}) => {
  // Chart dimensions
  const [chartWidth, setChartWidth] = useState(width);
  const [chartHeight, setChartHeight] = useState(height);
  const [marginTop, setMarginTop] = useState(20);
  const [marginRight, setMarginRight] = useState(20);
  const [marginBottom, setMarginBottom] = useState(30);
  const [marginLeft, setMarginLeft] = useState(40);
  
  // Curve parameters
  const [curveType, setCurveType] = useState<'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear'>('cardinal');
  const [curveTension, setCurveTension] = useState(0.5);
  
  // Fill options
  const [fill, setFill] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(0.4);
  
  // Point appearance
  const [showPoints, setShowPoints] = useState(true);
  const [pointRadius, setPointRadius] = useState(5);
  
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
  
  // Handle number input change with validation
  const handleNumberInput = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      setter(value);
    }
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
      const chartConfig: LineChartConfig = {
        width: chartWidth,
        height: chartHeight,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        curveType,
        curveTension,
        fill,
        fillOpacity,
        showPoints,
        pointRadius,
        showXAxis,
        showYAxis,
        yDomainMin,
        yDomainMax
      };
      
      // Create saved chart data
      const savedChart: SavedChartData = {
        id: Date.now().toString(),
        name: chartName.trim(),
        type: 'line',
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
    if (chart.type !== 'line') return;
    
    const config = chart.config as LineChartConfig;
    setChartWidth(config.width);
    setChartHeight(config.height);
    setMarginTop(config.marginTop);
    setMarginRight(config.marginRight);
    setMarginBottom(config.marginBottom);
    setMarginLeft(config.marginLeft);
    setCurveType(config.curveType);
    setCurveTension(config.curveTension);
    setFill(config.fill);
    setFillOpacity(config.fillOpacity);
    setShowPoints(config.showPoints);
    setPointRadius(config.pointRadius);
    setShowXAxis(config.showXAxis);
    setShowYAxis(config.showYAxis);
    setYDomainMin(config.yDomainMin);
    setYDomainMax(config.yDomainMax);
  };

  return (
    <div className="line-chart-controls">
      {/* Chart display */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>Line Chart</h2>
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
        
        <div ref={chartRef} className="chart-display">
          <LineChart
            data={data}
            width={chartWidth}
            height={chartHeight}
            marginTop={marginTop}
            marginRight={marginRight}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            curveType={curveType}
            curveTension={curveTension}
            fill={fill}
            fillOpacity={fillOpacity}
            showPoints={showPoints}
            pointRadius={pointRadius}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            yDomainMin={yDomainMin}
            yDomainMax={yDomainMax}
            onResize={(newWidth, newHeight) => {
              setChartWidth(newWidth);
              setChartHeight(newHeight);
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
      
      {/* Controls panel */}
      <div className="controls-panel">
        <h2>Chart Controls</h2>
        
        {/* Dimensions section */}
        <div className="section">
          <h3>Dimensions</h3>
          <div className="dimensions-grid">
            <div>
              <label>Width</label>
              <input
                type="number"
                min="200"
                max="1200"
                value={chartWidth}
                onChange={(e) => setChartWidth(parseInt(e.target.value) || 600)}
              />
            </div>
            <div>
              <label>Height</label>
              <input
                type="number"
                min="100"
                max="800"
                value={chartHeight}
                onChange={(e) => setChartHeight(parseInt(e.target.value) || 400)}
              />
            </div>
          </div>
        </div>
        
        {/* Curve section */}
        <div className="section">
          <h3>Curve</h3>
          <div className="control-group space-y">
            <div>
              <label>Type</label>
              <select
                value={curveType}
                onChange={(e) => setCurveType(e.target.value as 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear')}
              >
                <option value="cardinal">Cardinal</option>
                <option value="basis">Basis</option>
                <option value="natural">Natural</option>
                <option value="monotone">Monotone</option>
                <option value="catmullRom">Catmull-Rom</option>
                <option value="linear">Linear</option>
              </select>
            </div>
            <div>
              <label>Tension (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={curveTension}
                onChange={(e) => setCurveTension(parseFloat(e.target.value))}
              />
              <div className="range-value">{curveTension}</div>
            </div>
          </div>
        </div>
        
        {/* Line section */}
        <div className="section">
          <h3>Line</h3>
          <div className="control-group space-y">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={fill}
                onChange={(e) => setFill(e.target.checked)}
                id="fill-checkbox"
              />
              <label htmlFor="fill-checkbox">Fill area under line</label>
            </div>
            {fill && (
              <div>
                <label>Fill Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={fillOpacity}
                  onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                />
                <div className="range-value">{fillOpacity}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Points section */}
        <div className="section">
          <h3>Points</h3>
          <div className="control-group space-y">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={showPoints}
                onChange={(e) => setShowPoints(e.target.checked)}
                id="points-checkbox"
              />
              <label htmlFor="points-checkbox">Show data points</label>
            </div>
            {showPoints && (
              <>
                <div>
                  <label>Radius</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pointRadius}
                    onChange={(e) => setPointRadius(parseInt(e.target.value))}
                  />
                  <div className="range-value">{pointRadius}px</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Axes & Grid section */}
        <div className="section">
          <h3>Axes & Grid</h3>
          <div className="control-group space-y">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={showXAxis}
                onChange={(e) => setShowXAxis(e.target.checked)}
                id="x-axis-checkbox"
              />
              <label htmlFor="x-axis-checkbox">Show X Axis</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={showYAxis}
                onChange={(e) => setShowYAxis(e.target.checked)}
                id="y-axis-checkbox"
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
                type="number"
                value={yDomainMin === undefined ? '' : yDomainMin}
                onChange={handleOptionalNumberInput(setYDomainMin)}
                placeholder="Auto"
              />
            </div>
            <div>
              <label>Max Value</label>
              <input
                type="number"
                value={yDomainMax === undefined ? '' : yDomainMax}
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

export default LineChartControls; 