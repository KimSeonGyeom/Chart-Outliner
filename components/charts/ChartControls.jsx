"use client";

import BarChart from './BarChart.jsx';
import ExportSection from './ExportSection.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useDataStore } from '../store/dataStore.js';
import React from 'react';

export default function ChartControls({ chartRef }) {
  const chartData = useDataStore(state => state.chartData);
  
  return (
    <div>
      <div className="section-title">Current Chart</div>
      
      {/* Export options */}
      <ExportSection chartRef={chartRef} />
      
      {/* Chart display */}
      <div className="chart-display" ref={chartRef}>
        <BarChart />
      </div>
    </div>
  );
} 