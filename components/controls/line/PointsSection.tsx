import React, { useState, useEffect } from 'react';
import { PointsSectionProps } from '../types';

const pointShapeOptions = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'cross', label: 'Cross' },
  { value: 'star', label: 'Star' }
];

const PointsSection: React.FC<PointsSectionProps> = ({
  showPoints,
  pointRadius,
  pointShape = 'circle',
  pointStrokeWidth = 1,
  onShowPointsChange,
  onPointRadiusChange,
  onPointShapeChange,
  onPointStrokeWidthChange
}) => {
  // Track whether point stroke is enabled
  const [strokeEnabled, setStrokeEnabled] = useState(pointStrokeWidth > 0);
  // Store previous stroke width when toggling
  const [prevStrokeWidth, setPrevStrokeWidth] = useState(pointStrokeWidth > 0 ? pointStrokeWidth : 1);

  // Update stroke enabled state when stroke width changes from outside
  useEffect(() => {
    setStrokeEnabled(pointStrokeWidth > 0);
    if (pointStrokeWidth > 0) {
      setPrevStrokeWidth(pointStrokeWidth);
    }
  }, [pointStrokeWidth]);

  // Validate and handle point radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onPointRadiusChange(value);
    }
  };

  // Handle point shape change
  const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPointShapeChange(e.target.value);
  };

  // Toggle point stroke visibility
  const handleStrokeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setStrokeEnabled(isEnabled);
    
    if (isEnabled) {
      // Restore previous width when enabling
      onPointStrokeWidthChange(prevStrokeWidth);
    } else {
      // Set width to 0 when disabling
      onPointStrokeWidthChange(0);
    }
  };

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
          <>
            <div>
              <label>Point Shape</label>
              <div className="dropdown-container">
                <select 
                  value={pointShape}
                  onChange={handleShapeChange}
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
                  onChange={handleRadiusChange}
                  className="number-input"
                />
                <span className="unit">px</span>
              </div>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={strokeEnabled}
                onChange={handleStrokeToggle}
                id="point-stroke-checkbox"
              />
              <label htmlFor="point-stroke-checkbox">Show point outline</label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PointsSection; 