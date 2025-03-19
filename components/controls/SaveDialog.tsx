import React from 'react';
import { SaveDialogProps } from './types';

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  chartName,
  onClose,
  onSave,
  onChartNameChange
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="save-dialog">
      <div className="save-dialog-content">
        <h3>Save Chart</h3>
        <label>
          Chart Name:
          <input
            type="text"
            value={chartName}
            onChange={(e) => onChartNameChange(e.target.value)}
            placeholder="Enter a name for your chart"
          />
        </label>
        <div className="save-buttons">
          <button onClick={onClose}>Cancel</button>
          <button 
            onClick={onSave}
            disabled={!chartName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog; 