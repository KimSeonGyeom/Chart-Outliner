import React from 'react';
import { BarAppearanceSectionProps } from './types';
import FillPatternSection from './FillPatternSection';

const BarAppearanceSection: React.FC<BarAppearanceSectionProps> = ({
  barPadding,
  barFill = false,
  barFillOpacity = 0.5,
  barFillPattern = 'solid',
  barFillZoomLevel = 8,
  onBarPaddingChange,
  onBarFillChange,
  onBarFillOpacityChange,
  onBarFillPatternChange,
  onBarFillZoomLevelChange
}) => {
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
            <div>
              <label>Fill Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={barFillOpacity}
                onChange={(e) => onBarFillOpacityChange(parseFloat(e.target.value))}
              />
              <div className="range-value">{barFillOpacity}</div>
            </div>
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