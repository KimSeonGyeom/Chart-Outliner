import React from 'react';
import FillPatternSection from '../shared/FillPatternSection.jsx';

const BarAppearanceSection = ({
  barPadding,
  barFill = false,
  barFillOpacity = 1,
  barFillPattern = 'solid',
  barFillZoomLevel = 8,
  onBarPaddingChange,
  onBarFillChange,
  onBarFillOpacityChange,
  onBarFillPatternChange,
  onBarFillZoomLevelChange
}) => {
  React.useEffect(() => {
    if (barFill && barFillOpacity !== 1) {
      onBarFillOpacityChange(1);
    }
  }, [barFill, barFillOpacity, onBarFillOpacityChange]);

  return (
    <div className="section">
      <h3>Bar Appearance</h3>
      <div className="control-group space-y">
        <div>
          <label>Bar Padding</label>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={barPadding}
            onChange={(e) => onBarPaddingChange(parseFloat(e.target.value))}
          />
          <div className="range-value">{barPadding}</div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="bar-fill-checkbox"
            checked={barFill}
            onChange={(e) => onBarFillChange(e.target.checked)}
          />
          <label htmlFor="bar-fill-checkbox">Fill bars</label>
        </div>

        {barFill && (
          <>
            <FillPatternSection 
              fillPattern={barFillPattern}
              fillZoomLevel={barFillZoomLevel}
              onFillPatternChange={onBarFillPatternChange}
              onFillZoomLevelChange={onBarFillZoomLevelChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BarAppearanceSection; 