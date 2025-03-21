import React from 'react';
import { FillPatternSectionProps } from './types';

const fillPatternOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'diagonal', label: 'Diagonal Lines' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'zigzag', label: 'Zigzag' }
];

const FillPatternSection: React.FC<FillPatternSectionProps> = ({
  fillPattern,
  onFillPatternChange
}) => {
  return (
    <div className="section">
      <h3>Fill Pattern</h3>
      <div className="control-group space-y">
        <div>
          <label>Pattern Style</label>
          <div className="fill-pattern-options">
            {fillPatternOptions.map((option) => (
              <div 
                key={option.value}
                className={`fill-pattern-option ${fillPattern === option.value ? 'selected' : ''}`}
                onClick={() => onFillPatternChange(option.value)}
              >
                <div className={`fill-pattern-preview ${option.value}`} />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillPatternSection; 