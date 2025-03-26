import React from 'react';
import { useChartStore } from '../../store/chartStore';

const barShapeOptions = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'oval', label: 'Oval' },
  { value: 'trapezoid', label: 'Trapezoid' }
];

const BarShapeSection = () => {
  const barShape = useChartStore(state => state.barShape);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Bar Shape</div>
      <div className="dropdown-group">
        <label>Shape</label>
        <select 
          value={barShape}
          onChange={(e) => updateSetting('barShape', e.target.value)}
          className="dropdown-select"
        >
          {barShapeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BarShapeSection; 