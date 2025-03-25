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
      <div className="section-title">Stroke</div>
      <div className="checkbox-group">
        <input
          type="checkbox"
          checked={strokeWidth > 0}
          onChange={() => updateSetting('strokeWidth', strokeWidth > 0 ? 0 : 2)}
          id="stroke-visibility-checkbox"
        />
        <label htmlFor="stroke-visibility-checkbox">Show outline</label>
      </div>
      <div className="control-items-column">

        {strokeWidth > 0 && (
          <div className="input-group">
            <label>Width (px)</label>
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
        )}
        {strokeWidth > 0 && (
          <div className="dropdown-group">
            <label>Style</label>
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
          </div>
        )}
        {strokeWidth > 0 && (
          <div className="dropdown-group">
            <label>Outline Pattern</label>
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
          </div>
        )}
        {strokePattern === 'custom' && (
          <div className="input-group">
            <label>Custom Dash</label>
            <input
              type="text"
              value={dashArray}
              onChange={(e) => updateSetting('dashArray', e.target.value)}
              placeholder="e.g. 5,3 or 4,2,1,2"
              className="text-input"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StrokePatternSection; 