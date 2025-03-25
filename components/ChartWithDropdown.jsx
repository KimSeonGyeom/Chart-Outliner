"use client";

import React, { useState } from 'react';
import LineChartControls from './charts/LineChartControls.jsx';   
import BarChartControls from './charts/BarChartControls.jsx';
import TriangleTemplate from './templates/TriangleTemplate.jsx';
import DiamondTemplate from './templates/DiamondTemplate.jsx';



const ChartWithDropdown = ({
  data,
  chartType = 'line',
  width = 512,
  height = 512,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [fillEnabled, setFillEnabled] = useState(false);

  // Template mapping
  const templates = {
    'default': null,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };

  // Chart component mapping
  const ChartComponent = {
    'line': null,
    'bar': null,
  }[chartType];

  return (
    <div className="chart-container">
      <div key={`${chartType}-${selectedTemplate}-${fillEnabled}`}>
        {ChartComponent && (
          <ChartComponent 
            data={data} 
            width={width} 
            height={height} 
            // template={templates[selectedTemplate]}
            // fill={supportsFill ? fillEnabled : false}
          />
        )}
      </div>
    </div>
  );
};

export default ChartWithDropdown; 