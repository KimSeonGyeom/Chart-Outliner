import React from 'react';
import { BarAppearanceSectionProps } from './types';

const BarAppearanceSection: React.FC<BarAppearanceSectionProps> = ({
  barPadding,
  onBarPaddingChange
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
      </div>
    </div>
  );
};

export default BarAppearanceSection; 