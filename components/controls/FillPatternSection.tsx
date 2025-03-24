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
  fillZoomLevel,
  onFillPatternChange,
  onFillZoomLevelChange
}) => {
  // Create a ref for a temporary zoom level value during slider dragging
  const [previewZoomLevel, setPreviewZoomLevel] = React.useState(fillZoomLevel);
  
  // Update preview zoom level when fillZoomLevel prop changes
  React.useEffect(() => {
    setPreviewZoomLevel(fillZoomLevel);
  }, [fillZoomLevel]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    // Update preview immediately for real-time feedback
    setPreviewZoomLevel(newZoom);
  };

  const finalizeZoomChange = () => {
    // Apply the final zoom level when slider interaction ends
    onFillZoomLevelChange(previewZoomLevel);
  };

  const getZoomDescription = (zoom: number) => {
    if (zoom < 6) return 'Very Dense';
    if (zoom < 10) return 'Dense';
    if (zoom < 14) return 'Medium';
    if (zoom < 20) return 'Sparse';
    return 'Very Sparse';
  };

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
                <div 
                  className={`fill-pattern-preview ${option.value}`} 
                  style={{ 
                    backgroundSize: `${previewZoomLevel}px ${previewZoomLevel}px` 
                  }}
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label>Pattern Density</label>
          <input
            type="range"
            min="3"
            max="30"
            step="0.5"
            value={previewZoomLevel}
            onChange={handleZoomChange}
            onMouseUp={finalizeZoomChange}
            onTouchEnd={finalizeZoomChange}
          />
          <div className="range-display">
            <div className="range-value">{previewZoomLevel.toFixed(1)}</div>
            <div className="range-label">{getZoomDescription(previewZoomLevel)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillPatternSection; 