import React from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const DimensionsSection = () => {
  // Get dimensions from shared store
  const width = useSharedStore(state => state.width);
  const height = useSharedStore(state => state.height);
  const updateSetting = useSharedStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Dimensions</div>
      <div className="dimensions-grid">
        <div>
          <label>Width</label>
          <input
            type="number"
            min="200"
            max="1200"
            value={width}
            onChange={(e) => updateSetting('width', parseInt(e.target.value) || 600)}
          />
        </div>
        <div>
          <label>Height</label>
          <input
            type="number"
            min="100"
            max="800"
            value={height}
            onChange={(e) => updateSetting('height', parseInt(e.target.value) || 400)}
          />
        </div>
      </div>
    </div>
  );
};

export default DimensionsSection; 