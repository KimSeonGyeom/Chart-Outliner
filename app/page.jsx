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
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
  // Chart refs
  const chartRef = useRef(null);

  // Handle export button click
  const handleExport = () => {
    // Generate a filename with timestamp
    const fileName = `chart-outliner-${chartType}-chart-${Date.now()}`;
    setExportOption('exportFileName', fileName);
    
    if (chartRef && chartRef.current) {
      downloadChart(
        chartRef, 
        fileName, 
        exportFileType
      ).catch(error => {
        console.error('Error exporting chart:', error);
      });
    }
  };

  return (
    <main className="container">
      <header>
        <div className="main-title">Chart Outliner</div>
      </header>

      <div className="chart-layout">
        {/* Left side - Chart and chart-specific controls */}
        <div className="chart-section">
          <div className="section-title">Current Chart</div>
          
          {/* Export options */}
          <div className="export-section">
            <div className="radio-group">
              <input
                type="radio"
                id="png-option"
                name="export-type"
                value="png"
                checked={exportFileType === 'png'}
                onChange={() => setExportOption('exportFileType', 'png')}
              />
              <label htmlFor="png-option">PNG</label>
            </div>
            <div className="radio-group">
              <input
                type="radio" 
                id="svg-option"
                name="export-type"
                value="svg"
                checked={exportFileType === 'svg'}
                onChange={() => setExportOption('exportFileType', 'svg')}
              />
              <label htmlFor="svg-option">SVG</label>
            </div>
            <button className="export-button" onClick={handleExport}>
              Export
            </button>
          </div>
          
          {/* Chart display */}
          <div className="chart-display" ref={chartRef}>
            {chartType === 'bar' ? <BarChart /> : <LineChart />}
          </div>
        </div>
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <ControlPanel />
        </div>
      </div>
    </main>
  );
}
