import { useChartStore } from './store/chartStore.js';

const TopEdgeWidthSection = () => {
  // Use the chart store for top edge image width scale
  const topEdgeImageWidthScale = useChartStore(state => state.topEdgeImageWidthScale);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Edge Image Width</div>
      <div className="control-items">
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={topEdgeImageWidthScale}
          onChange={(e) => updateSetting('topEdgeImageWidthScale', parseFloat(e.target.value))}
        />
        <div className="range-value">{topEdgeImageWidthScale.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default TopEdgeWidthSection; 