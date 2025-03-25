import React from 'react';
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

const ControlPanel = () => {
  const chartType = useSharedStore(state => state.chartType);

  return (
    <div className="controls-panel">
      <label>Export Settings</label>
      <div className="button-group">
        <div className="button-group">
          <div>
            <input
              type="radio"
              id="png-option"
              name="export-type"
              value="png"
              defaultChecked
            />
            <label htmlFor="png-option">PNG</label>
          </div>
          <div>
            <input
              type="radio" 
              id="svg-option"
              name="export-type"
              value="svg"
            />
            <label htmlFor="svg-option">SVG</label>
          </div>
        </div>
        <button className="export-button">
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
export default ControlPanel; 