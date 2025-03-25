import React from 'react';

// Common preset options for both chart types
const presetOptions = [
  { value: 'basic', label: 'Basic Data', forChartTypes: ['bar', 'line'] },
  { value: 'rising', label: 'Rising Trend', forChartTypes: ['bar', 'line'] },
  { value: 'falling', label: 'Falling Trend', forChartTypes: ['bar', 'line'] },
  { value: 'wave', label: 'Wave Pattern', forChartTypes: ['bar', 'line'] },
  { value: 'exponential', label: 'Exponential Growth', forChartTypes: ['bar', 'line'] },
  { value: 'logarithmic', label: 'Logarithmic Growth', forChartTypes: ['bar', 'line'] },
  { value: 'sinusoidal', label: 'Sine Wave', forChartTypes: ['bar', 'line'] }
];

const DataSection = ({
  selectedPreset,
  onPresetChange,
  onRandomize,
  chartType
}) => {
  // Filter options based on chart type
  const filteredOptions = presetOptions.filter(option => 
    option.forChartTypes.includes(chartType)
  );
  
  return (
    <div className="section">
      <h3>Preset Data</h3>
      <div className="control-group">
        <div className="data-presets">
          <select 
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {filteredOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom" disabled={selectedPreset !== "custom"}>Custom</option>
          </select>
          <button 
            className="randomize-button"
            onClick={onRandomize}
            title="Generate random data"
          >
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSection; 