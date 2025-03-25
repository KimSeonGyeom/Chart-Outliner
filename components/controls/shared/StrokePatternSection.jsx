import React, { useEffect } from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const strokePatternOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'dash-dot', label: 'Dash-Dot' },
  { value: 'long-dash', label: 'Long Dash' },
  { value: 'custom', label: 'Custom' }
];

const strokeStyleOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'brush', label: 'Brush' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'rough', label: 'Rough' }
];

const StrokePatternSection = () => {
  // Get stroke settings from shared store
  const strokePattern = useSharedStore(state => state.strokePattern);
  const strokeWidth = useSharedStore(state => state.strokeWidth);
  const strokeStyle = useSharedStore(state => state.strokeStyle);
  const dashArray = useSharedStore(state => state.dashArray);
  const updateSetting = useSharedStore(state => state.updateSetting);

  return (
    <div className="section">
      <div className="section-title">Stroke Settings</div>
      
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={strokeWidth > 0}
            onChange={() => updateSetting('strokeWidth', strokeWidth > 0 ? 0 : 2)}
            id="stroke-visibility-checkbox"
          />
          <label htmlFor="stroke-visibility-checkbox">Show outline</label>
        </div>

        {strokeWidth > 0 && (
          <>
            <div className="control-row">
              <label>Stroke Width (px)</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={strokeWidth}
                  onChange={(e) => updateSetting('strokeWidth', parseFloat(e.target.value))}
                  className="number-input"
                />
              </div>
            </div>

            <div className="control-row">
              <label>Stroke Style</label>
              <div className="dropdown-container">
                <select 
                  value={strokeStyle}
                  onChange={(e) => updateSetting('strokeStyle', e.target.value)}
                  className="dropdown-select"
                >
                  {strokeStyleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="stroke-preview-container">
                  <div className={`stroke-style-preview ${strokeStyle}`} />
                </div>
              </div>
            </div>

            <div className="control-row">
              <label>Outline Pattern</label>
              <div className="dropdown-container">
                <select 
                  value={strokePattern}
                  onChange={(e) => updateSetting('strokePattern', e.target.value)}
                  className="dropdown-select"
                >
                  {strokePatternOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="stroke-preview-container">
                  <div 
                    className={`stroke-pattern-preview ${strokePattern}`} 
                    style={{ height: strokeWidth < 2 ? 4 : 2*strokeWidth }} 
                  />
                </div>
              </div>
            </div>

            {strokePattern === 'custom' && (
              <div className="control-row">
                <label>Custom Dash (format)</label>
                <input
                  type="text"
                  value={dashArray}
                  onChange={(e) => updateSetting('dashArray', e.target.value)}
                  placeholder="e.g. 5,3 or 4,2,1,2"
                  className="text-input"
                />
                <div className="hint-text">Enter comma-separated values for line and gap lengths</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StrokePatternSection; 