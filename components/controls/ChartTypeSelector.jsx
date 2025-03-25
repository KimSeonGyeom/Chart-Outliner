import React from 'react';
import { useSharedStore } from '../store/sharedStore.js';

const ChartTypeSelector = () => {
  // Get chart type from shared store
  const chartType = useSharedStore(state => state.chartType);
  const setChartType = useSharedStore(state => state.setChartType);
  
  return (
    <div className="chart-type-selector">
      <div className="section-title">Chart Type</div>
      <div className="chart-type-options">
        <button 
          className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
        <button 
          className={`chart-type-button ${chartType === 'line' ? 'active' : ''}`}
          onClick={() => setChartType('line')}
        >
          Line Chart
        </button>
      </div>
    </div>
  );
};

export default ChartTypeSelector; 