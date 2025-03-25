import React from 'react';
import { useUIStore } from '../../store/uiStore.js';
import { useSharedStore } from '../../store/sharedStore.js';

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
  const fill = useSharedStore(state => state.fill);
  const fillPattern = useSharedStore(state => state.fillPattern);
  const fillZoomLevel = useSharedStore(state => state.fillZoomLevel);
  const fillOpacity = useSharedStore(state => state.fillOpacity);
  const updateSetting = useSharedStore(state => state.updateSetting);
  
  // Use the previewZoomLevel from the UI store for immediate visual feedback
  const previewZoomLevel = useUIStore(state => state.previewZoomLevel);
  const setPreviewZoomLevel = useUIStore(state => state.setPreviewZoomLevel);

  return (
    <div className="section">
      <div className="section-title">Fill</div>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="fill-checkbox"
            checked={fill}
            onChange={(e) => updateSetting('fill', e.target.checked)}
          />
          <label htmlFor="fill-checkbox">Fill</label>
        </div>
        
        {fill && (
          <>
            <div className="control-row">
              <label>Pattern Style</label>
              <div className="dropdown-container">
                <select 
                  value={fillPattern}
                  onChange={(e) => updateSetting('fillPattern', e.target.value)}
                  className="dropdown-select"
                >
                  {fillPatternOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                onChange={(e) => setPreviewZoomLevel(parseFloat(e.target.value))}
                onMouseUp={() => updateSetting('fillZoomLevel', previewZoomLevel)}
                onTouchEnd={() => updateSetting('fillZoomLevel', previewZoomLevel)}
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