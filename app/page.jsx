"use client";

import React, { useRef } from 'react';
import BarChart from '../components/charts/BarChart.jsx';
import LineChart from '../components/charts/LineChart.jsx';
import { useSharedStore } from '../components/store/sharedStore.js';
import { useChartStore } from '../components/store/chartStore.js';
import { 
  ControlPanel,
  downloadChart
} from '../components/controls';
import './page.scss';

export default function Home() {
  const chartType = useSharedStore(state => state.chartType);
  const setChartType = useSharedStore(state => state.setChartType);
  
  // Chart refs
  const chartRef = useRef(null);

  return (
    <main className="container">
      <header>
        <div className="main-title">Chart Outliner</div>
      </header>

      <div className="chart-layout">
        {/* Left side - Chart and chart-specific controls */}
        <div className="chart-section">
          <div className="section-title">Current Chart</div>
          {/* Chart display */}
          {chartType === 'bar' ? <BarChart ref={chartRef}/> : <LineChart ref={chartRef}/>}
        </div>
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <ControlPanel chartRef={chartRef} />
        </div>
      </div>
    </main>
  );
}
