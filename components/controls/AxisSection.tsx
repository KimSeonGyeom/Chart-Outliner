import React from 'react';
import { AxisSectionProps } from './types';

const AxisSection: React.FC<AxisSectionProps> = ({ 
  axisOptions,
  onAxisOptionChange
}) => {
  return (
    <div className="section">
      <h3>Axes & Grid</h3>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="x-axis-checkbox"
            checked={axisOptions.showXAxis}
            onChange={(e) => onAxisOptionChange('showXAxis', e.target.checked)}
          />
          <label htmlFor="x-axis-checkbox">Show X Axis</label>
        </div>
        
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="y-axis-checkbox"
            checked={axisOptions.showYAxis}
            onChange={(e) => onAxisOptionChange('showYAxis', e.target.checked)}
          />
          <label htmlFor="y-axis-checkbox">Show Y Axis</label>
        </div>
      </div>
    </div>
  );
};

export default AxisSection; 