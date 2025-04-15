import { useDataStore } from './store/dataStore.js';
import { sampleDataSets } from './store/dataStore.js';

const DataSection = () => {
  // Get data settings from data store
  const selectedPreset = useDataStore(state => state.selectedPreset);
  const setSelectedPreset = useDataStore(state => state.setSelectedPreset);
  const randomizeData = useDataStore(state => state.randomizeData);
  const numDataPoints = useDataStore(state => state.numDataPoints);
  const setNumDataPoints = useDataStore(state => state.setNumDataPoints);
  const loadPresetData = useDataStore(state => state.loadPresetData);

  const handleDataPointsChange = (value) => {
    if (!isNaN(value) && value >= 3 && value <= 7) {
      setNumDataPoints(value);
      
      // Regenerate data with new point count
      loadPresetData(selectedPreset);
    }
  };

  return (
    <div className="section">
      <div className="section-title">Preset Data</div>
      <div className="control-items">
        <div className="dropdown-group">
          <select 
            value={selectedPreset}
            onChange={(e) => loadPresetData(e.target.value)}
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
        
        <div className="control-item">
          <label htmlFor="num-data-points">Number of Data Points</label>
          <div className="number-input-group">
            <input
              id="num-data-points"
              type="number"
              min="3"
              max="7"
              value={numDataPoints}
              onChange={(e) => handleDataPointsChange(parseInt(e.target.value))}
            />
            <div className="number-controls">
              <button 
                onClick={() => numDataPoints < 7 && handleDataPointsChange(numDataPoints + 1)}
                disabled={numDataPoints >= 7}
              >+</button>
              <button 
                onClick={() => numDataPoints > 3 && handleDataPointsChange(numDataPoints - 1)}
                disabled={numDataPoints <= 3}
              >-</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSection; 