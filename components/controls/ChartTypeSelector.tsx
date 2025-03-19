import React from 'react';
import { ChartTypeSelectorProps } from './types';

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  activeChart,
  onChartTypeChange
}) => {
  return (
    <div className="section">
      <h3>Chart Type</h3>
      <div className="chart-selector">
        <button 
          className={`chart-type-button ${activeChart === 'bar' ? 'active' : ''}`}
          onClick={() => onChartTypeChange('bar')}
        >
          Bar Chart
        </button>
        <button 
          className={`chart-type-button ${activeChart === 'line' ? 'active' : ''}`}
          onClick={() => onChartTypeChange('line')}
        >
          Line Chart
        </button>
      </div>
    </div>
  );
};

export default ChartTypeSelector; 