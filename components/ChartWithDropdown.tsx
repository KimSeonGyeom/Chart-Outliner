"use client";

import React, { useState } from 'react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import TriangleTemplate from './templates/TriangleTemplate';
import DiamondTemplate from './templates/DiamondTemplate';
import { ChartData } from './templates/types';

interface ChartWithDropdownProps {
  data: ChartData;
  chartType?: 'line' | 'bar';
  width?: number;
  height?: number;
}

const ChartWithDropdown: React.FC<ChartWithDropdownProps> = ({
  data,
  chartType = 'line',
  width = 600,
  height = 400,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [fillEnabled, setFillEnabled] = useState<boolean>(false);

  // Template mapping
  const templates: Record<string, React.ComponentType<any> | null> = {
    'default': null,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };

  // Chart component mapping
  const ChartComponent = {
    'line': LineChart,
    'bar': BarChart,
  }[chartType];

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplate(e.target.value);
  };

  const handleFillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFillEnabled(e.target.checked);
  };

  // Check if current chart type supports fill
  const supportsFill = chartType === 'line';

  return (
    <div className="chart-container">
      <div className="mb-4 flex items-center">
        <div className="mr-4">
          <label htmlFor="template-select" className="mr-2 font-medium">
            Select Template:
          </label>
          <select 
            id="template-select" 
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="default">Default</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        
        {supportsFill && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fill-checkbox"
              checked={fillEnabled}
              onChange={handleFillChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="fill-checkbox" className="ml-2 font-medium">
              Fill Area
            </label>
          </div>
        )}
      </div>
      
      <div key={`${chartType}-${selectedTemplate}-${fillEnabled}`}>
        <ChartComponent 
          data={data} 
          width={width} 
          height={height} 
          template={templates[selectedTemplate]}
          fill={supportsFill ? fillEnabled : false}
        />
      </div>
    </div>
  );
};

export default ChartWithDropdown; 