import React from 'react';
import { PointsSectionProps } from './types';

const PointsSection: React.FC<PointsSectionProps> = ({
  showPoints,
  pointRadius,
  onShowPointsChange,
  onPointRadiusChange
}) => {
  return (
    <div className="section">
      <h3>Points</h3>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => onShowPointsChange(e.target.checked)}
            id="points-checkbox"
          />
          <label htmlFor="points-checkbox">Show data points</label>
        </div>
        {showPoints && (
          <div>
            <label>Radius</label>
            <input
              type="range"
              min="1"
              max="10"
              value={pointRadius}
              onChange={(e) => onPointRadiusChange(parseInt(e.target.value))}
            />
            <div className="range-value">{pointRadius}px</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsSection; 