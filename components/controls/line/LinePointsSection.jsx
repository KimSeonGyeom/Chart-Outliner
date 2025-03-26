import React from 'react';
import { useChartStore } from '../../store/chartStore';

const pointShapeOptions = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'cross', label: 'Cross' },
  { value: 'star', label: 'Star' }
];

const LinePointsSection = () => {
  const showPoints = useChartStore(state => state.showPoints);
  const pointRadius = useChartStore(state => state.pointRadius);
  const pointShape = useChartStore(state => state.pointShape);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Data Points</div>
      <div className="checkbox-group">
        <input
          type="checkbox"
          checked={showPoints}
          onChange={() => updateSetting('showPoints', !showPoints)}
          id="points-visibility-checkbox"
        />
        <label htmlFor="points-visibility-checkbox">Show data points</label>
      </div>
      {showPoints && (
        <div className="control-items-column">
          <div className="input-group">
            <label>Size (px)</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={pointRadius}
              onChange={(e) => updateSetting('pointRadius', parseFloat(e.target.value))}
              className="number-input"
            />
          </div>
          <div className="dropdown-group">
            <label>Shape</label>
            <select 
              value={pointShape}
              onChange={(e) => updateSetting('pointShape', e.target.value)}
              className="dropdown-select"
            >
              {pointShapeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinePointsSection; 