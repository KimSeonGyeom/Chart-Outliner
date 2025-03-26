import React, { useState, useContext } from 'react';
import ChartTypeSelector from './shared/ChartTypeSelector.jsx';
import DimensionsSection from './shared/DimensionsSection.jsx';
import AxisSection from './shared/AxisSection.jsx';
import DomainSection from './shared/DomainSection.jsx';
import StrokePatternSection from './shared/StrokePatternSection.jsx';
import DataSection from './shared/DataSection.jsx';
import LineCurveSection from './line/LineCurveSection.jsx';
import BarPaddingSection from './bar/BarPaddingSection.jsx';
import './ControlPanel.scss';
import { useSharedStore } from '../store/sharedStore.js';
import { useChartStore } from '../store/chartStore.js';
import { downloadChart } from './downloadUtils.js';

// Bar chart specific controls component
const BarControls = () => {
  return (
    <div className="chart-specific-controls">
      <BarPaddingSection />
    </div>
  );
};

// Line chart specific controls component
const LineControls = () => {
  return (
    <div className="chart-specific-controls">
      <LineCurveSection />
    </div>
  );
};

// Shared controls component
const SharedControls = () => {
  return (
    <div className="shared-controls">
      <ChartTypeSelector />
      <DimensionsSection />
      <DataSection />
      <AxisSection />
      <DomainSection />
      <StrokePatternSection /> 
    </div>
  );
};

const ControlPanel = ({ chartRef }) => {
  const chartType = useSharedStore(state => state.chartType);
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  
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
    <div className="controls-panel">
      <div className="header">Export Settings</div>
      <div className="button-group">        
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
      <div className="chart-controls">
        <SharedControls />
        {chartType === 'bar' ? <BarControls /> : <LineControls />}
      </div>
    </div>
  );
};

// Export components for direct use in other files if needed
export { BarControls, LineControls, SharedControls };
export default ControlPanel; 