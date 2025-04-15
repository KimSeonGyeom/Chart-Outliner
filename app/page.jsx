"use client";

import React, { useRef } from 'react';
import { 
  ControlPanel,
  downloadChart,
  AIGenerationSection
} from '../components/controls';
import ChartControls from '../components/charts/ChartControls.jsx';
import './page.scss';

export default function Home() {
  // Chart refs
  const chartRef = useRef(null);
  

  return (
    <main className="container">
      <header>
        <div className="main-title">
          Chart Outliner
        </div>
      </header>

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
    </main>
  );
}
