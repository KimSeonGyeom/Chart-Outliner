import React, { ReactNode } from 'react';
import { BaseControlPanelProps, ChartType } from './types';
import ChartTypeSelector from './ChartTypeSelector';

interface ControlPanelProps extends BaseControlPanelProps {
  sharedControls: ReactNode;
  chartSpecificControls: ReactNode;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  chartType,
  onChartTypeChange,
  onSaveClick,
  sharedControls,
  chartSpecificControls
}) => {
  return (
    <div className="controls-panel">
      <div className="controls-header">
        <h2>Chart Controls</h2>
        <button 
          className="save-button" 
          onClick={onSaveClick}
        >
          Save Chart
        </button>
      </div>
      
      <ChartTypeSelector 
        activeChart={chartType}
        onChartTypeChange={onChartTypeChange}
      />
      
      {/* Shared controls section */}
      <div className="shared-controls">
        {sharedControls}
      </div>
      
      {/* Chart-specific controls section */}
      <div className="chart-specific-controls">
        <div className="section chart-specific-header">
          <h3>{chartType === 'bar' ? 'Bar Chart' : 'Line Chart'} Options</h3>
        </div>
        {chartSpecificControls}
      </div>
    </div>
  );
};

export default ControlPanel; 