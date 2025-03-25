"use client";

import React, { useState } from 'react';
import { exportChartVariations } from '../data/exportVariations.js';
import { downloadChart } from '../controls';

const ExportVariationsButton = ({
  chartType,
  chartRef,
  setChartSettings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const handleExportClick = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setProgress(0);
    
    try {
      // Track progress
      const progressTracker = (current, totalVariations) => {
        setProgress(current);
        setTotal(totalVariations);
      };
      
      // Export chart variations for the specific chart type
      await exportChartVariations(
        chartType,
        chartRef,
        downloadChart,
        setChartSettings,
        progressTracker
      );
      
      alert(`All ${chartType} chart variations exported successfully!`);
    } catch (error) {
      console.error(`Failed to export ${chartType} chart variations:`, error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-variations-button-container">
      <button
        className={`export-variations-button ${isExporting ? 'exporting' : ''}`}
        onClick={handleExportClick}
        disabled={isExporting}
      >
        {isExporting ? `Exporting... (${progress}/${total})` : `Export ${chartType} Chart Variations`}
      </button>
      {isExporting && (
        <div className="export-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }} 
          />
        </div>
      )}
    </div>
  );
};

export default ExportVariationsButton; 