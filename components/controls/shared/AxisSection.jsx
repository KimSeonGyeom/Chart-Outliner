import React from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const AxisSection = () => {
  // Get axis options from shared store
  const showXAxis = useSharedStore(state => state.showXAxis);
  const showYAxis = useSharedStore(state => state.showYAxis);
  const updateSetting = useSharedStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Axes & Grid</div>
      
      <div className="control-items">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="x-axis-checkbox"
            checked={showXAxis}
            onChange={(e) => updateSetting('showXAxis', e.target.checked)}
          />
          <label htmlFor="x-axis-checkbox">Show X Axis</label>
        </div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="y-axis-checkbox"
            checked={showYAxis}
            onChange={(e) => updateSetting('showYAxis', e.target.checked)}
          />
          <label htmlFor="y-axis-checkbox">Show Y Axis</label>
        </div>
      </div>
    </div>
  );
};

export default AxisSection; 