"use client";

import React, { useState } from 'react';
import { ChartData } from '../templates/types';
import LineChart from './LineChart';
import '../../styles/components/LineChartControls.scss';

// Sample data for demonstration
const sampleData: ChartData = [
  { x: 'Jan', y: 30, color: '#3498db' },
  { x: 'Feb', y: 50, color: '#2ecc71' },
  { x: 'Mar', y: 20, color: '#e74c3c' },
  { x: 'Apr', y: 40, color: '#f1c40f' },
  { x: 'May', y: 70, color: '#9b59b6' },
  { x: 'Jun', y: 60, color: '#1abc9c' },
  { x: 'Jul', y: 80, color: '#34495e' },
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
  
  // // Line appearance
  // const [lineColor, setLineColor] = useState('#3498db');
  // const [lineWidth, setLineWidth] = useState(1.5);
  // const [lineDash, setLineDash] = useState<number[]>([]);
  // const [lineDashInput, setLineDashInput] = useState('');
  
  // Fill options
  const [fill, setFill] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(0.4);
  
  // Point appearance
  const [showPoints, setShowPoints] = useState(true);
  const [pointRadius, setPointRadius] = useState(5);
  // const [pointStroke, setPointStroke] = useState('#ffffff');
  // const [pointStrokeWidth, setPointStrokeWidth] = useState(1);
  
  // Axis appearance
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  // const [xAxisTickCount, setXAxisTickCount] = useState<number | undefined>(undefined);
  // const [yAxisTickCount, setYAxisTickCount] = useState<number | undefined>(undefined);
  
  // Domain customization
  const [yDomainMin, setYDomainMin] = useState<number | undefined>(undefined);
  const [yDomainMax, setYDomainMax] = useState<number | undefined>(undefined);
  
  // // Grid lines
  // const [showGrid, setShowGrid] = useState(false);
  // const [gridColor, setGridColor] = useState('#e0e0e0');
  // const [gridOpacity, setGridOpacity] = useState(0.5);
  
  // // Handle line dash input change and convert to array
  // const handleLineDashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLineDashInput(e.target.value);
  //   // Convert comma-separated string to array of numbers
  //   const dashArray = e.target.value
  //     .split(',')
  //     .map(v => parseInt(v.trim()))
  //     .filter(v => !isNaN(v));
    
  //   setLineDash(dashArray.length > 0 ? dashArray : []);
  // };
  
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

  return (
    <div className="line-chart-controls">
      {/* Chart display */}
      <div className="chart-container">
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
          // lineColor={lineColor}
          // lineWidth={lineWidth}
          // lineDash={lineDash}
          fill={fill}
          fillOpacity={fillOpacity}
          showPoints={showPoints}
          pointRadius={pointRadius}
          // pointStroke={pointStroke}
          // pointStrokeWidth={pointStrokeWidth}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          // xAxisTickCount={xAxisTickCount}
          // yAxisTickCount={yAxisTickCount}
          yDomainMin={yDomainMin}
          yDomainMax={yDomainMax}
          // showGrid={showGrid}
          // gridColor={gridColor}
          // gridOpacity={gridOpacity}
        />
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
                onChange={(e) => setCurveType(e.target.value as any)}
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
            {/* <div>
              <label>Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-10 h-8"
                />
                <input
                  type="text"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                />
              </div>
            </div> */}
            {/* <div>
              <label>Width</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseFloat(e.target.value))}
              />
              <div className="range-value">{lineWidth}px</div>
            </div> */}
            {/* <div>
              <label>Dash Pattern (e.g. 5,5)</label>
              <input
                type="text"
                value={lineDashInput}
                onChange={handleLineDashChange}
                placeholder="e.g. 5,5"
              />
            </div> */}
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
                {/* <div>
                  <label>Stroke Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={pointStroke}
                      onChange={(e) => setPointStroke(e.target.value)}
                      className="w-10 h-8"
                    />
                    <input
                      type="text"
                      value={pointStroke}
                      onChange={(e) => setPointStroke(e.target.value)}
                    />
                  </div>
                </div> */}
                {/* <div>
                  <label>Stroke Width</label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={pointStrokeWidth}
                    onChange={(e) => setPointStrokeWidth(parseFloat(e.target.value))}
                  />
                  <div className="range-value">{pointStrokeWidth}px</div>
                </div> */}
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
            {/* <div>
              <label>X Axis Tick Count</label>
              <input
                type="number"
                min="2"
                value={xAxisTickCount === undefined ? '' : xAxisTickCount}
                onChange={handleOptionalNumberInput(setXAxisTickCount)}
                placeholder="Auto"
              />
            </div> */}
            {/* <div>
              <label>Y Axis Tick Count</label>
              <input
                type="number"
                min="2"
                value={yAxisTickCount === undefined ? '' : yAxisTickCount}
                onChange={handleOptionalNumberInput(setYAxisTickCount)}
                placeholder="Auto"
              />
            </div> */}
            {/* <div className="checkbox-group">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                id="grid-checkbox"
              />
              <label htmlFor="grid-checkbox">Show Grid Lines</label>
            </div>
            {showGrid && (
              <>
                <div>
                  <label>Grid Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                      className="w-10 h-8"
                    />
                    <input
                      type="text"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label>Grid Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                  />
                  <div className="range-value">{gridOpacity}</div>
                </div>
              </>
            )} */}
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