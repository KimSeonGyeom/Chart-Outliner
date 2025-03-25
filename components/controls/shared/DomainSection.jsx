import React from 'react';

const DomainSection = ({
  yDomainMin,
  yDomainMax,
  onDomainChange
}) => {
  // Handle optional number input change
  const handleOptionalNumberInput = (setter) => (e) => {
    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
    if (value === undefined || !isNaN(value)) {
      setter === 'min' 
        ? onDomainChange(value, yDomainMax)
        : onDomainChange(yDomainMin, value);
    }
  };

  return (
    <div className="section">
      <h3>Y Domain</h3>
      <div className="dimensions-grid">
        <div>
          <label>Min Value</label>
          <input
            type="text"
            value={yDomainMin === undefined ? "Auto" : yDomainMin}
            onChange={handleOptionalNumberInput('min')}
            placeholder="Auto"
          />
        </div>
        
        <div>
          <label>Max Value</label>
          <input
            type="text"
            value={yDomainMax === undefined ? "Auto" : yDomainMax}
            onChange={handleOptionalNumberInput('max')}
            placeholder="Auto"
          />
        </div>
      </div>
    </div>
  );
};

export default DomainSection; 