import React from 'react';
import { LineFillSectionProps } from './types';

const LineFillSection: React.FC<LineFillSectionProps> = ({
  fill,
  fillOpacity,
  onFillChange,
  onFillOpacityChange
}) => {
  return (
    <div className="section">
      <h3>Line</h3>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={fill}
            onChange={(e) => onFillChange(e.target.checked)}
            id="fill-checkbox"
          />
          <label htmlFor="fill-checkbox">Fill area under line</label>
        </div>
        {fill && (
          <div>
            <label>Fill Opacity</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={fillOpacity}
              onChange={(e) => onFillOpacityChange(parseFloat(e.target.value))}
            />
            <div className="range-value">{fillOpacity}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineFillSection; 