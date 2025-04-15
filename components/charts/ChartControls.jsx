"use client";

import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import ExportSection from './ExportSection.jsx';
import { useSharedStore } from '../store/sharedStore.js';
import { useDataStore } from '../store/dataStore.js';
import React from 'react';

export default function ChartControls({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const authorIntention = useDataStore(state => state.authorIntention);
  const setAuthorIntention = useDataStore(state => state.setAuthorIntention);
  const chartData = useDataStore(state => state.chartData);
  const dataSubject = chartData.subject;
  
  return (
    <div>
      <div className="section-title">Current Chart</div>
      
      {/* Export options */}
      <ExportSection chartRef={chartRef} />
      
      {/* Chart display */}
      <div className="chart-display" ref={chartRef}>
        {chartType === 'bar' ? <BarChart /> : <LineChart />}
      </div>
    </div>
  );
} 