import React from 'react';
import { LineFillSectionProps } from './types';
import FillPatternSection from './FillPatternSection';

const LineFillSection: React.FC<LineFillSectionProps> = ({
  fill,
  fillOpacity = 0.5,
  fillPattern = 'solid',
  fillZoomLevel = 8,
  onFillChange,
  onFillOpacityChange,
  onFillPatternChange,
  onFillZoomLevelChange
}) => {
  return (
    <div className="section">
      <h3>Line Fill</h3>
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
          <>
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
            <FillPatternSection 
              fillPattern={fillPattern}
              fillZoomLevel={fillZoomLevel}
              onFillPatternChange={onFillPatternChange}
              onFillZoomLevelChange={onFillZoomLevelChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LineFillSection; 