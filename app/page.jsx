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
  const showExportOptions = useChartStore(state => state.showExportOptions);
  const exportFileName = useChartStore(state => state.exportFileName);
  const exportFileType = useChartStore(state => state.exportFileType);
  const updateSetting = useChartStore(state => state.updateSetting);
  
  // Chart refs
  const chartRef = useRef(null);
  
  // Handle export click
  const handleExportClick = () => {
    updateSetting('showExportOptions', !showExportOptions);
  };
  
  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      // Download the chart
      downloadChart(chartRef, exportFileName, exportFileType)
        .then(() => {
          // Close export options after successful export
          updateSetting('showExportOptions', false);
        })
        .catch(error => {
          console.error('Error exporting chart:', error);
        });
    }
  };
  
  // Export options component based on chart type
  const exportOptionsComponent = (
    <div className={`export-options ${chartType === 'bar' ? 'bar-export' : 'line-export'}`}>
      <div className="export-title">Export Options</div>
      
      <div className="form-group">
        <label htmlFor="fileName">File Name</label>
        <input
          id="fileName"
          type="text"
          value={exportFileName}
          onChange={(e) => updateSetting('exportFileName', e.target.value)}
          placeholder="Enter a name for your file"
        />
      </div>
      
      <div className="form-group">
        <label>File Format</label>
        <div className="format-options">
          {['png', 'jpg', 'svg'].map((format) => (
            <div 
              key={format}
              className={`format-option ${exportFileType === format ? 'selected' : ''}`}
              onClick={() => updateSetting('exportFileType', format)}
            >
              <div className="format-radio">
                <div className="radio-inner"></div>
              </div>
              <span className="format-label">{format.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="export-actions">
        <button 
          className="cancel-button"
          onClick={() => updateSetting('showExportOptions', false)}
        >
          Cancel
        </button>
        <button 
          className="export-button"
          onClick={handleExport}
        >
          Export
        </button>
      </div>
    </div>
  );

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
          <div className="chart-display-container">
            <div ref={chartRef} className="chart-display">
              {chartType === 'bar' ? <BarChart/> : <LineChart/>}
            </div>
          </div>
        </div>
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <ControlPanel
            chartType={chartType}
            onChartTypeChange={setChartType}
            onExportClick={handleExportClick}
            showExportOptions={showExportOptions}
            exportOptions={exportOptionsComponent}
          />
        </div>
      </div>
    </main>
  );
}
