"use client";

import React, { useState } from 'react';
// import LineChart from './charts/LineChart';
import LineChartControls from './charts/LineChartControls';   
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
    'line': LineChartControls,
    'bar': BarChart,
  }[chartType];

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplate(e.target.value);
  };

  return (
    <div className="chart-container">
      <div key={`${chartType}-${selectedTemplate}-${fillEnabled}`}>
        <ChartComponent 
          data={data} 
          width={width} 
          height={height} 
          template={templates[selectedTemplate]}
          // fill={supportsFill ? fillEnabled : false}
        />
      </div>
    </div>
  );
};

export default ChartWithDropdown; 