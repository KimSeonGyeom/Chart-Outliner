import React from 'react';
import { LineFillSectionProps } from './types';

const LineFillSection: React.FC<LineFillSectionProps> = ({
  fill,
  onFillChange,
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
      </div>
    </div>
  );
};

export default LineFillSection; 