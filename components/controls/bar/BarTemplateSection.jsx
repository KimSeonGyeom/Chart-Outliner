import React from 'react';

const BarTemplateSection = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="section">
      <h3>Bar Template</h3>
      <div className="control-group">
        <label>Select Template</label>
        <select 
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value)}
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