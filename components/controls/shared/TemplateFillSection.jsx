import React from 'react';
import { useSharedStore } from '../../store/sharedStore.js';

const TemplateFillSection = () => {
  // Get template settings from stores
  const useTemplateFill = useSharedStore(state => state.useTemplateFill);
  const templateFillDensity = useSharedStore(state => state.templateFillDensity);
  const templateFillOpacity = useSharedStore(state => state.templateFillOpacity);
  const templateFillSize = useSharedStore(state => state.templateFillSize);
  const updateSharedSetting = useSharedStore(state => state.updateSetting);
  const selectedTemplate = useSharedStore(state => state.selectedTemplate);

  return (
    <div className="section">
      <div className="section-title">Template Fill</div>
      <div className="control-group space-y">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="template-fill-checkbox"
            checked={useTemplateFill}
            onChange={(e) => updateSharedSetting('useTemplateFill', e.target.checked)}
          />
          <label htmlFor="template-fill-checkbox">Use Template Fill</label>
        </div>
        
        {useTemplateFill && (
          <>
            <div className="control-group">
              <label>Select Template</label>
              <select 
                value={selectedTemplate}
                onChange={(e) => updateSharedSetting('selectedTemplate', e.target.value)}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
            <div className="control-row">
              <label>Density</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={templateFillDensity}
                onChange={(e) => updateSharedSetting('templateFillDensity', parseInt(e.target.value))}
              />
              <div className="range-display">
                <div className="range-value">{templateFillDensity}</div>
              </div>
            </div>
            
            <div className="control-row">
              <label>Template Size</label>
              <input
                type="range"
                min="2"
                max="20"
                step="0.5"
                value={templateFillSize}
                onChange={(e) => updateSharedSetting('templateFillSize', parseFloat(e.target.value))}
              />
              <div className="range-display">
                <div className="range-value">{templateFillSize.toFixed(1)}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateFillSection; 