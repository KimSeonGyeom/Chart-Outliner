import React from 'react';
import ChartTypeSelector from './ChartTypeSelector.jsx';
import DimensionsSection from './shared/DimensionsSection.jsx';
import AxisSection from './shared/AxisSection.jsx';
import DomainSection from './shared/DomainSection.jsx';
import StrokePatternSection from './shared/StrokePatternSection.jsx';
import TemplateFillSection from './shared/TemplateFillSection.jsx';
import DataSection from './shared/DataSection.jsx';
import LineAppearanceSection from './line/LineAppearanceSection.jsx';
import PointsSection from './line/LinePointsSection.jsx';
import BarTemplateSection from './bar/BarTemplateSection.jsx';
import BarAppearanceSection from './bar/BarAppearanceSection.jsx';
import './ControlPanel.scss';

// Bar chart specific controls component
const BarControls = () => {
  return (
    <div className="chart-specific-controls">
      <div className="controls-heading">Bar Chart Settings</div>
      <BarTemplateSection />
      <BarAppearanceSection />
    </div>
  );
};

// Line chart specific controls component
const LineControls = () => {
  return (
    <div className="chart-specific-controls">
      <div className="controls-heading">Line Chart Settings</div>
      <LineAppearanceSection />
      <PointsSection />
    </div>
  );
};

// Shared controls component
const SharedControls = () => {
  return (
    <div className="shared-controls">
      <div className="controls-heading">Chart Settings</div>
      <DimensionsSection />
      <DataSection />
      <AxisSection />
      <DomainSection />
      <StrokePatternSection /> 
      <TemplateFillSection />
    </div>
  );
};

const ControlPanel = ({
  chartType,
  onChartTypeChange,
  onExportClick,
  showExportOptions,
  exportOptions
}) => {
  return (
    <div className="controls-panel">
      <div className="controls-header">
        <div className="header-title">Chart Controls</div>
        <div className="button-group">
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
      
      {showExportOptions && exportOptions && (
        <div className="export-options-container">
          {exportOptions}
        </div>
      )}
      
      <ChartTypeSelector 
        activeChart={chartType}
        onChartTypeChange={onChartTypeChange}
      />
      
      <div className="chart-controls">
        <SharedControls chartType={chartType} />
        {chartType === 'bar' ? <BarControls /> : <LineControls />}
      </div>
    </div>
  );
};

// Export components for direct use in other files if needed
export default ControlPanel; 