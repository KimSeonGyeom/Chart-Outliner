import React, { ReactNode } from 'react';
import { BaseControlPanelProps, ChartType } from './types';
import ChartTypeSelector from './ChartTypeSelector';

interface ControlPanelProps extends BaseControlPanelProps {
  sharedControls: ReactNode;
  chartSpecificControls: ReactNode;
  onExportClick?: () => void;
  showExportOptions?: boolean;
  exportOptions?: ReactNode;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  chartType,
  onChartTypeChange,
  onSaveClick,
  onExportClick,
  sharedControls,
  chartSpecificControls,
  showExportOptions,
  exportOptions
}) => {
  return (
    <div className="controls-panel">
      <div className="controls-header">
        <h2>Chart Controls</h2>
        <div className="button-group">
          <button 
            className="save-button" 
            onClick={onSaveClick}
          >
            Save Chart
          </button>
          {onExportClick && (
            <button 
              className="export-button" 
              onClick={onExportClick}
            >
              Export
            </button>
          )}
        </div>
      </div>
      
      {/* Export options section */}
      {showExportOptions && exportOptions && (
        <div className="export-options-container">
          {exportOptions}
        </div>
      )}
      
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