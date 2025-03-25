import React from 'react';
import FillSection from '../shared/FillSection.jsx';
import { useChartStore } from '../../store/chartStore.js';

const BarAppearanceSection = () => {
  // Use the chart store for bar padding
  const barPadding = useChartStore(state => state.barSettings.barPadding);
  const updateBarSettings = useChartStore(state => state.updateBarSettings);

  const handleBarPaddingChange = (value) => {
    updateBarSettings({ barPadding: value });
  };

  return (
    <div className="section">
      <div className="control-group space-y">
        <div>
          <label>Bar Padding</label>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={barPadding}
            onChange={(e) => handleBarPaddingChange(parseFloat(e.target.value))}
          />
          <div className="range-value">{barPadding}</div>
        </div>
      </div>
    </div>
  );
};

export default BarAppearanceSection; 