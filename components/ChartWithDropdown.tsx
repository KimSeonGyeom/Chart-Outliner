"use client";

import React, { useState } from 'react';
// import LineChart from './charts/LineChart';
import LineChartControls from './charts/LineChartControls';   
// import BarChart from './charts/BarChart';
import BarChartControls from './charts/BarChartControls';
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
  width = 512,
  height = 512,
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
    'bar': BarChartControls,
  }[chartType];

  return (
    <div className="chart-container">
      <div key={`${chartType}-${selectedTemplate}-${fillEnabled}`}>
        <ChartComponent 
          data={data} 
          width={width} 
          height={height} 
          // template={templates[selectedTemplate]}
          // fill={supportsFill ? fillEnabled : false}
        />
      </div>
    </div>
  );
};

export default ChartWithDropdown; 