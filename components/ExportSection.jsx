"use client";

import { downloadChart } from './downloadUtils.js';
import { useChartStore } from './store/chartStore.js';
import { useAiStore } from './store/aiStore.js';

export default function ExportSection({ chartRef }) {
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  const selectedEdgeImageData = useAiStore(state => state.selectedEdgeImageData);
  
  const handleExport = () => {
    // Generate a filename with timestamp
    const fileName = `chart-outliner-${Date.now()}`;
    setExportOption('exportFileName', fileName);
    
    if (chartRef && chartRef.current) {
      // Check if the Canny edge version is available
      const hasCannyEdge = selectedEdgeImageData !== null;
      
      if (hasCannyEdge) {
        // Export both original and Canny edge versions at once
        downloadChart(
          chartRef.current, 
          fileName, 
          exportFileType,
          true,   // asOutlines (default)
          false,  // forceFill
          'both'  // chartVersion - export both normal and canny edge
        ).catch(error => {
          console.error('Error exporting charts:', error);
        });
      } else {
        // Just export the original chart if no Canny edge is selected
        downloadChart(
          chartRef.current, 
          fileName, 
          exportFileType
        ).catch(error => {
          console.error('Error exporting chart:', error);
        });
      }
      
      // Always export filled version with modified filename
      downloadChart(
        chartRef.current, 
        `${fileName}-filled`, 
        exportFileType,
        true,  // asOutlines (default)
        true,  // forceFill (force black fill)
        'original' // chartVersion - only filled version for original
      ).catch(error => {
        console.error('Error exporting filled chart:', error);
      });
    }
  };

  return (
    <div className="export-section">
      <div className="radio-group">
        <input
          type="radio"
          id="png-option"
          name="export-type"
          value="png"
          checked={exportFileType === 'png'}
          onChange={() => setExportOption('exportFileType', 'png')}
        />
        <label htmlFor="png-option">PNG</label>
      </div>
      <div className="radio-group">
        <input
          type="radio" 
          id="svg-option"
          name="export-type"
          value="svg"
          checked={exportFileType === 'svg'}
          onChange={() => setExportOption('exportFileType', 'svg')}
        />
        <label htmlFor="svg-option">SVG</label>
      </div>
      {selectedEdgeImageData && (
        <div className="export-info">
          <small>Both original and Canny edge versions will be exported</small>
        </div>
      )}
      <button className="export-button" onClick={handleExport}>
        Export
      </button>
    </div>
  );
} 