import React from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const DomainSection = () => {
  // Get domain options from shared store
  const yDomainMin = useSharedStore(state => state.yDomainMin);
  const yDomainMax = useSharedStore(state => state.yDomainMax);
  const updateSetting = useSharedStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Y Domain</div>
      <div className="control-items">
        <div className="input-group">
          <label>Min</label>
          <input
            type="text"
            value={yDomainMin === undefined ? "Auto" : yDomainMin}
            onChange={(e) => updateSetting('yDomainMin', e.target.value)}
            placeholder="Auto"
          />
        </div>
        
        <div className="input-group">
          <label>Max</label>
          <input
            type="text"
            value={yDomainMax === undefined ? "Auto" : yDomainMax}
            onChange={(e) => updateSetting('yDomainMax', e.target.value)}
            placeholder="Auto"
          />
        </div>
      </div>
    </div>
  );
};

export default DomainSection; 