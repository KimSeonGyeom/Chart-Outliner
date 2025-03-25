import React from 'react';
import { useDataStore } from '../../store/dataStore.js';
import { sampleDataSets } from '../../store/dataStore.js';

const DataSection = () => {
  // Get data settings from data store
  const selectedPreset = useDataStore(state => state.selectedPreset);
  const setSelectedPreset = useDataStore(state => state.setSelectedPreset);
  const randomizeData = useDataStore(state => state.randomizeData);

  return (
    <div className="data-section">
      <div className="section-title">Preset Data</div>
      
      <div className="control-group">
        <div className="data-presets">
          <select 
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
          >
            {Object.entries(sampleDataSets).map(([key, data]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <button 
            className="randomize-button"
            onClick={() => randomizeData()}
            title="Generate random data"
          >
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSection; 