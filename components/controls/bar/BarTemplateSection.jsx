import React from 'react';
import { useChartStore } from '../../store/chartStore';

const BarTemplateSection = () => {
  const selectedTemplate = useChartStore(state => state.selectedTemplate);
  const updateSetting = useChartStore(state => state.updateSetting);
  
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