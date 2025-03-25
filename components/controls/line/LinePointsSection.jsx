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

const PointsSection = () => {
  const showPoints = useChartStore(state => state.showPoints);
  const pointRadius = useChartStore(state => state.pointRadius);
  const pointShape = useChartStore(state => state.pointShape);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => updateSetting('showPoints', e.target.checked)}
            id="points-checkbox"
          />
          <label htmlFor="points-checkbox">Show data points</label>
        </div>
        {showPoints && (
          <>
            <div>
              <label>Point Shape</label>
              <div className="dropdown-container">
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
                <div className="point-preview-container">
                  <div className={`point-shape-preview ${pointShape}`} />
                </div>
              </div>
            </div>
            <div>
              <label>Radius (px)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pointRadius}
                  onChange={(e) => updateSetting('pointRadius', parseFloat(e.target.value))}
                  className="number-input"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PointsSection; 