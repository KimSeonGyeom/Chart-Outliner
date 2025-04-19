"use client";

import React, { useRef } from 'react';
import ControlPanel from './ControlPanel.jsx';
import AIGenerationSection from './AIGenerationSection.jsx';
import ChartControls from './ChartControls.jsx';
import { useUIStore } from './store/uiStore';

const HomePage = () => {
  // Chart refs
  const chartRef = useRef(null);
  
  return (
    <div className="chart-layout">
      {/* Left side - Chart and chart-specific controls */}
      <div className="chart-section">
        <ControlPanel />
        <ChartControls chartRef={chartRef} />
      </div>
      
      {/* Right side - Control Panel */}
      <div className="control-section">
        <AIGenerationSection chartRef={chartRef} />
      </div>
    </div>
  );
};

export default HomePage; 