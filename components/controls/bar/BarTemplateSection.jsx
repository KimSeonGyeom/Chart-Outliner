import React from 'react';
import { useSharedStore } from '../../store/sharedStore';

const BarTemplateSection = () => {
  const selectedTemplate = useSharedStore(state => state.selectedTemplate);
  const updateSetting = useSharedStore(state => state.updateSetting);
  
  return (
    <div className="section">
      <div className="control-group">
        <label>Select Template</label>
        <select 
          value={selectedTemplate}
          onChange={(e) => updateSetting('selectedTemplate', e.target.value)}
        >
          <option value="none">Default Bars</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="diamond">Diamond</option>
        </select>
      </div>
    </div>
  );
};

export default BarTemplateSection; 