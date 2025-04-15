import { useChartStore } from './store/chartStore.js';

const BarAppearanceSection = () => {
  // Use the chart store for bar padding
  const barPadding = useChartStore(state => state.barPadding);
  const updateSetting = useChartStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Padding</div>
      <div className="control-items">
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.05"
          value={barPadding}
          onChange={(e) => updateSetting('barPadding', parseFloat(e.target.value))}
        />
        <div className="range-value">{barPadding}</div>
      </div>
    </div>
  );
};

export default BarAppearanceSection; 