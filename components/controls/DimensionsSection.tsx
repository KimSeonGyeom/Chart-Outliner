import React from 'react';
import { DimensionsSectionProps } from './types';

const DimensionsSection: React.FC<DimensionsSectionProps> = ({ 
  dimensions, 
  onDimensionChange 
}) => {
  return (
    <div className="section">
      <h3>Dimensions</h3>
      <div className="dimensions-grid">
        <div>
          <label>Width</label>
          <input
            type="number"
            min="200"
            max="1200"
            value={dimensions.width}
            onChange={(e) => onDimensionChange('width', parseInt(e.target.value) || 600)}
          />
        </div>
        <div>
          <label>Height</label>
          <input
            type="number"
            min="100"
            max="800"
            value={dimensions.height}
            onChange={(e) => onDimensionChange('height', parseInt(e.target.value) || 400)}
          />
        </div>
      </div>
    </div>
  );
};

export default DimensionsSection; 