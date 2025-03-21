import React from 'react';
import { StrokePatternSectionProps } from './types';

const strokePatternOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'dash-dot', label: 'Dash-Dot' },
  { value: 'long-dash', label: 'Long Dash' }
];

const StrokePatternSection: React.FC<StrokePatternSectionProps> = ({
  strokePattern,
  onStrokePatternChange
}) => {
  return (
    <div className="section">
      <h3>Stroke Pattern</h3>
      <div className="control-group space-y">
        <div>
          <label>Outline Style</label>
          <div className="stroke-pattern-options">
            {strokePatternOptions.map((option) => (
              <div 
                key={option.value}
                className={`stroke-pattern-option ${strokePattern === option.value ? 'selected' : ''}`}
                onClick={() => onStrokePatternChange(option.value)}
              >
                <div className={`stroke-pattern-preview ${option.value}`} />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrokePatternSection; 