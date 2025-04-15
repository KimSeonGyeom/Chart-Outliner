import { useChartStore } from './store/chartStore.js';

const DomainSection = () => {
  // Get domain options from chart store
  const yDomainMin = useChartStore(state => state.yDomainMin);
  const yDomainMax = useChartStore(state => state.yDomainMax);
  const updateSetting = useChartStore(state => state.updateSetting);

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