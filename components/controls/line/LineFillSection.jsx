import React from 'react';
import FillPatternSection from '../shared/FillPatternSection.jsx';

const LineFillSection = ({
  fill,
  fillOpacity = 1,
  fillPattern = 'solid',
  fillZoomLevel = 8,
  onFillChange,
  onFillOpacityChange,
  onFillPatternChange,
  onFillZoomLevelChange
}) => {
  React.useEffect(() => {
    if (fill && fillOpacity !== 1) {
      onFillOpacityChange(1);
    }
  }, [fill, fillOpacity, onFillOpacityChange]);

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