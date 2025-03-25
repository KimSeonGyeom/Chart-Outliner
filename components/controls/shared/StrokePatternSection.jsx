import React, { useState, useEffect } from 'react';

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

const StrokePatternSection = ({
  strokePattern,
  strokeWidth = 1,
  strokeStyle = 'normal',
  dashArray = '6,4',
  onStrokePatternChange,
  onStrokeWidthChange,
  onStrokeStyleChange,
  onDashArrayChange
}) => {
  // Store custom dash array input state
  const [dashInput, setDashInput] = useState(dashArray);
  // Track whether stroke is enabled
  const [strokeEnabled, setStrokeEnabled] = useState(strokeWidth > 0);
  // Store previous stroke width when toggling
  const [prevStrokeWidth, setPrevStrokeWidth] = useState(strokeWidth > 0 ? strokeWidth : 1);

  // Update stroke enabled state when stroke width changes from outside
  useEffect(() => {
    setStrokeEnabled(strokeWidth > 0);
    if (strokeWidth > 0) {
      setPrevStrokeWidth(strokeWidth);
    }
  }, [strokeWidth]);

  // Handle custom dash array change
  const handleDashInputChange = (e) => {
    setDashInput(e.target.value);
  };

  // Apply custom dash array when blur
  const applyCustomDash = () => {
    if (dashInput.trim() && strokePattern === 'custom') {
      onDashArrayChange(dashInput);
    }
  };

  // Toggle stroke visibility
  const handleStrokeToggle = (e) => {
    const isEnabled = e.target.checked;
    setStrokeEnabled(isEnabled);
    
    if (isEnabled) {
      // Restore previous width when enabling
      onStrokeWidthChange(prevStrokeWidth);
    } else {
      // Set width to 0 when disabling
      onStrokeWidthChange(0);
    }
  };

  // Validate and handle stroke width change
  const handleStrokeWidthChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onStrokeWidthChange(value);
      if (value > 0) {
        setPrevStrokeWidth(value);
      }
    }
  };

  // Handle stroke style dropdown change
  const handleStrokeStyleChange = (e) => {
    onStrokeStyleChange(e.target.value);
  };

  // Handle stroke pattern dropdown change
  const handleStrokePatternChange = (e) => {
    onStrokePatternChange(e.target.value);
  };

  return (
    <div className="section">
      <h3>Stroke Settings</h3>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={strokeEnabled}
            onChange={handleStrokeToggle}
            id="stroke-visibility-checkbox"
          />
          <label htmlFor="stroke-visibility-checkbox">Show outline</label>
        </div>

        {strokeEnabled && (
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
                  onChange={handleStrokeWidthChange}
                  className="number-input"
                  disabled={!strokeEnabled}
                />
              </div>
            </div>

            <div className="control-row">
              <label>Stroke Style</label>
              <div className="dropdown-container">
                <select 
                  value={strokeStyle}
                  onChange={handleStrokeStyleChange}
                  className="dropdown-select"
                  disabled={!strokeEnabled}
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
                  onChange={handleStrokePatternChange}
                  className="dropdown-select"
                  disabled={!strokeEnabled}
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
                  value={dashInput}
                  onChange={handleDashInputChange}
                  onBlur={applyCustomDash}
                  placeholder="e.g. 5,3 or 4,2,1,2"
                  className="text-input"
                  disabled={!strokeEnabled}
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