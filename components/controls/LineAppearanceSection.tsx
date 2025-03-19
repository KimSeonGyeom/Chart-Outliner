import React from 'react';
import { LineAppearanceSectionProps } from './types';

const LineAppearanceSection: React.FC<LineAppearanceSectionProps> = ({
  curveType,
  curveTension,
  onCurveTypeChange,
  onCurveTensionChange
}) => {
  return (
    <div className="section">
      <h3>Curve</h3>
      <div className="control-group space-y">
        <div>
          <label>Type</label>
          <select
            value={curveType}
            onChange={(e) => onCurveTypeChange(e.target.value as any)}
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
          <label>Tension (0-1)</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={curveTension}
            onChange={(e) => onCurveTensionChange(parseFloat(e.target.value))}
          />
          <div className="range-value">{curveTension}</div>
        </div>
      </div>
    </div>
  );
};

export default LineAppearanceSection; 