"use client";

import React, { useRef } from 'react';
import { 
  ControlPanel,
  downloadChart
} from '../components/controls';
import ChartControls from '../components/charts/ChartControls.jsx';
import { useCostStore } from '../components/store/costStore.js';
import './page.scss';

export default function Home() {
  // Chart refs
  const chartRef = useRef(null);
  
  // Get the total cost from the cost store
  const totalCost = useCostStore(state => state.totalCost);
  
  // Format the cost to display with 2 decimal places
  const formattedCost = `$${totalCost.toFixed(2)}`;

  return (
    <main className="container">
      <header>
        <div className="main-title">
          Chart Outliner
          <span className="cost-display">{formattedCost}</span>
        </div>
      </header>

      <div className="chart-layout">
        {/* Left side - Chart and chart-specific controls */}
        <ChartControls chartRef={chartRef} />
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <ControlPanel />
        </div>
      </div>
    </main>
  );
}
