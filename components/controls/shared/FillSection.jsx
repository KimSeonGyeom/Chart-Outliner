import React from 'react';
import { useUIStore } from '../../store/uiStore.js';
import { useChartStore } from '../../store/chartStore.js';

const fillPatternOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'diagonal', label: 'Diagonal Lines' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'zigzag', label: 'Zigzag' }
];

const FillSection = () => {
  // Use shared fill settings from the chart store
  const fill = useChartStore(state => state.fillSettings.fill);
  const fillPattern = useChartStore(state => state.fillSettings.fillPattern);
  const fillZoomLevel = useChartStore(state => state.fillSettings.fillZoomLevel);
  const updateFillSettings = useChartStore(state => state.updateFillSettings);
  
  // Use the previewZoomLevel from the UI store for immediate visual feedback
  const previewZoomLevel = useUIStore(state => state.previewZoomLevel);
  const setPreviewZoomLevel = useUIStore(state => state.setPreviewZoomLevel);
  
  // Update preview zoom level in store when fillZoomLevel changes
  React.useEffect(() => {
    setPreviewZoomLevel(fillZoomLevel);
  }, [fillZoomLevel, setPreviewZoomLevel]);

  const handleFillChange = (checked) => {
    updateFillSettings({ fill: checked });
  };

  const handlePatternChange = (pattern) => {
    updateFillSettings({ fillPattern: pattern });
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    // Update preview immediately for real-time feedback
    setPreviewZoomLevel(newZoom);
  };

  const finalizeZoomChange = () => {
    // Apply the final zoom level when slider interaction ends
    updateFillSettings({ fillZoomLevel: previewZoomLevel });
  };

  return (
    <div className="section">
      <h3>Fill</h3>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="fill-checkbox"
            checked={fill}
            onChange={(e) => handleFillChange(e.target.checked)}
          />
          <label htmlFor="fill-checkbox">Fill</label>
        </div>
        
        {fill && (
          <>
            <div className="control-row">
              <label>Pattern Style</label>
              <div className="fill-pattern-options">
                {fillPatternOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`fill-pattern-option ${fillPattern === option.value ? 'selected' : ''}`}
                    onClick={() => handlePatternChange(option.value)}
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
            
            <div className="control-row">
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FillSection; 