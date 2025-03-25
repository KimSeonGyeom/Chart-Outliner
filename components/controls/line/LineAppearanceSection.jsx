import React from 'react';
import './LinePointsSection.scss';

const LineAppearanceSection = ({
  curveType,
  curveTension,
  onCurveTypeChange,
  onCurveTensionChange
}) => {
  return (
    <div className="section">
      <div className="control-group space-y">
        <div>
          <label>Curve Type</label>
          <select
            value={curveType}
            onChange={(e) => onCurveTypeChange(e.target.value)}
          >
            <option value="cardinal">Cardinal</option>
            <option value="basis">Basis</option>
            <option value="natural">Natural</option>
            <option value="monotone">Monotone</option>
            <option value="catmullRom">Catmull-Rom</option>
            <option value="linear">Linear</option>
          </select>
        </div>
        <div>
          <div className='control-slider'>
            <label>Curve Tension (0-1)</label>
            <div className="range-value">{curveTension}</div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={curveTension}
            onChange={(e) => onCurveTensionChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default LineAppearanceSection; 