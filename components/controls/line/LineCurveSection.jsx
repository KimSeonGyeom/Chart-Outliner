import React from 'react';
import { useChartStore } from '../../store/chartStore';

const LineAppearanceSection = () => {
  const curveType = useChartStore(state => state.curveType);
  const curveTension = useChartStore(state => state.curveTension);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Curve Settings</div>
      <div className="control-items">
        <label>Curve Type</label>
        <select
          value={curveType}
          onChange={(e) => updateSetting('curveType', e.target.value)}
        >
          <option value="cardinal">Cardinal</option>
          <option value="basis">Basis</option>
          <option value="step">Step</option>
          <option value="monotone">Monotone</option>
          <option value="catmullRom">Catmull-Rom</option>
          <option value="linear">Linear</option>
        </select>
      </div>
      <div className="control-items">
        <label>Curve Tension (0-1)</label>
        <div className="range-value">{curveTension}</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={curveTension}
          onChange={(e) => updateSetting('curveTension', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default LineAppearanceSection; 