import React from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const FillSection = () => {
  // Get fill settings from shared store
  const fill = useSharedStore(state => state.fill);
  const fillOpacity = useSharedStore(state => state.fillOpacity);
  const updateSetting = useSharedStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Fill</div>
      <div className="checkbox-group">
        <input
          type="checkbox"
          checked={fill}
          onChange={() => updateSetting('fill', !fill)}
          id="fill-checkbox"
        />
        <label htmlFor="fill-checkbox">Fill with solid black</label>
      </div>
    </div>
  );
};

export default FillSection; 