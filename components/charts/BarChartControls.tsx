"use client";

import React, { useState } from 'react';
import { ChartData } from '../templates/types';
import BarChart from './BarChart';
import DiamondTemplate from '../templates/DiamondTemplate';
import TriangleTemplate from '../templates/TriangleTemplate';
import RectangleTemplate from '../templates/RectangleTemplate';
import CircleTemplate from '../templates/CircleTemplate';

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
  const [barColor, setBarColor] = useState('#3498db');
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('rectangle');
  
  // Axis appearance
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  const [xAxisTickCount, setXAxisTickCount] = useState<number | undefined>(undefined);
  const [yAxisTickCount, setYAxisTickCount] = useState<number | undefined>(undefined);
  
  // Grid lines
  const [showGrid, setShowGrid] = useState(false);
  const [gridColor, setGridColor] = useState('#e0e0e0');
  const [gridOpacity, setGridOpacity] = useState(0.5);
  
  // Domain customization
  const [yDomainMin, setYDomainMin] = useState<number | undefined>(undefined);
  const [yDomainMax, setYDomainMax] = useState<number | undefined>(undefined);

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="mb-4">Select different templates to customize the appearance of your bar chart</p>
      
      <div className="mb-2 flex items-center gap-2">
        <label className="font-medium">Select Bar Template:</label>
        <select 
          className="border p-1 rounded"
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
      
      <div className="mb-6">
        <BarChart
          data={data}
          width={width}
          height={height}
          barPadding={barPadding}
          barColor={barColor}
          template={templates[selectedTemplate]}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          xAxisTickCount={xAxisTickCount}
          yAxisTickCount={yAxisTickCount}
          yDomainMin={yDomainMin}
          yDomainMax={yDomainMax}
          showGrid={showGrid}
          gridColor={gridColor}
          gridOpacity={gridOpacity}
        />
      </div>
      
      <div className="border-t pt-4">
        <h2 className="text-2xl font-bold mb-4">Chart Controls</h2>
        
        {/* Dimensions section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Dimensions</h3>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block">Width</label>
              <input
                type="number"
                className="border p-1 w-full"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
              />
            </div>
            <div>
              <label className="block">Height</label>
              <input
                type="number"
                className="border p-1 w-full"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 400)}
              />
            </div>
          </div>
        </div>
        
        {/* Bar appearance section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Bar Appearance</h3>
          <div className="mb-2">
            <label className="block">Bar Padding</label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              className="w-64"
              value={barPadding}
              onChange={(e) => setBarPadding(parseFloat(e.target.value))}
            />
            <span className="ml-2">{barPadding}</span>
          </div>
          
          <div className="mb-2">
            <label className="block">Bar Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
              />
              <input
                type="text"
                className="border p-1 w-64"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Axes & Grid section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Axes & Grid</h3>
          <div className="flex items-center gap-6 mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="x-axis-checkbox"
                checked={showXAxis}
                onChange={(e) => setShowXAxis(e.target.checked)}
              />
              <label htmlFor="x-axis-checkbox">Show X Axis</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="y-axis-checkbox"
                checked={showYAxis}
                onChange={(e) => setShowYAxis(e.target.checked)}
              />
              <label htmlFor="y-axis-checkbox">Show Y Axis</label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block">X Axis Tick Count</label>
              <input
                type="text"
                className="border p-1 w-full"
                value={xAxisTickCount === undefined ? "Auto" : xAxisTickCount}
                onChange={(e) => {
                  const value = e.target.value === "Auto" ? undefined : parseInt(e.target.value);
                  setXAxisTickCount(isNaN(value as number) ? undefined : value);
                }}
                placeholder="Auto"
              />
            </div>
            
            <div>
              <label className="block">Y Axis Tick Count</label>
              <input
                type="text"
                className="border p-1 w-full"
                value={yAxisTickCount === undefined ? "Auto" : yAxisTickCount}
                onChange={(e) => {
                  const value = e.target.value === "Auto" ? undefined : parseInt(e.target.value);
                  setYAxisTickCount(isNaN(value as number) ? undefined : value);
                }}
                placeholder="Auto"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="grid-checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <label htmlFor="grid-checkbox">Show Grid Lines</label>
          </div>
          
          {showGrid && (
            <>
              <div className="mb-2">
                <label className="block">Grid Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gridColor}
                    onChange={(e) => setGridColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="border p-1 w-64"
                    value={gridColor}
                    onChange={(e) => setGridColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <label className="block">Grid Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  className="w-64"
                  value={gridOpacity}
                  onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                />
                <span className="ml-2">{gridOpacity}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Domain section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Y Domain</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Min Value</label>
              <input
                type="text"
                className="border p-1 w-full"
                value={yDomainMin === undefined ? "Auto" : yDomainMin}
                onChange={handleOptionalNumberInput(setYDomainMin)}
                placeholder="Auto"
              />
            </div>
            
            <div>
              <label className="block">Max Value</label>
              <input
                type="text"
                className="border p-1 w-full"
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