"use client";

import React from 'react';
import { downloadChart } from '../controls/index.js';
import { useChartStore } from '../store/chartStore.js';
import { useSharedStore } from '../store/sharedStore.js';

export default function ExportSection({ chartRef }) {
  const chartType = useSharedStore(state => state.chartType);
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);

  const handleExport = () => {
    // Generate a filename with timestamp
    const fileName = `chart-outliner-${chartType}-chart-${Date.now()}`;
    setExportOption('exportFileName', fileName);
    
    if (chartRef && chartRef.current) {
      // Download regular chart
      downloadChart(
        chartRef, 
        fileName, 
        exportFileType
      ).catch(error => {
        console.error('Error exporting chart:', error);
      });
      
      // Download filled version with modified filename
      downloadChart(
        chartRef, 
        `${fileName}-filled`, 
        exportFileType,
        true,  // asOutlines (default)
        true   // forceFill (new parameter)
      ).catch(error => {
        console.error('Error exporting filled chart:', error);
      });
    }
  };

  return (
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
  );
} 