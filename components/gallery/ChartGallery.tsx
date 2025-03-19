import React, { useState, useEffect } from 'react';
import SavedChart from './SavedChart';
import { SavedChartData } from './types';
import { CHART_SAVED_EVENT } from '../controls/saveUtils';
import '../../styles/components/ChartGallery.scss';

interface ChartGalleryProps {
  onLoadChart: (chart: SavedChartData) => void;
}

function ChartGallery({ onLoadChart }: ChartGalleryProps) {
  const [savedCharts, setSavedCharts] = useState<SavedChartData[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load saved charts from localStorage
  const loadSavedCharts = () => {
    const storedCharts = localStorage.getItem('savedCharts');
    if (storedCharts) {
      try {
        const parsedCharts = JSON.parse(storedCharts);
        setSavedCharts(parsedCharts);
      } catch (error) {
        console.error('Error parsing saved charts:', error);
      }
    }
  };

  // Handle chart saved event
  const handleChartSaved = () => {
    loadSavedCharts();
  };

  // Initial load
  useEffect(() => {
    loadSavedCharts();
    
    // Add event listener for chart saved event
    window.addEventListener(CHART_SAVED_EVENT, handleChartSaved);
    
    return () => {
      window.removeEventListener(CHART_SAVED_EVENT, handleChartSaved);
    };
  }, []);

  const handleDeleteChart = (id: string) => {
    const updatedCharts = savedCharts.filter(chart => chart.id !== id);
    setSavedCharts(updatedCharts);
    localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
    
    // Dispatch event to ensure all instances update
    window.dispatchEvent(new CustomEvent(CHART_SAVED_EVENT));
  };

  const handleLoadChart = (chart: SavedChartData) => {
    onLoadChart(chart);
  };

  return (
    <div className="chart-gallery-container">
      <div className="gallery-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h2>Saved Charts</h2>
        <button className="toggle-button">
          {isExpanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="gallery-content">
          {savedCharts.length === 0 ? (
            <div className="empty-gallery">
              <p>No saved charts yet. Save a chart to see it here.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {savedCharts.map(chart => (
                <SavedChart
                  key={chart.id}
                  chart={chart}
                  onDelete={handleDeleteChart}
                  onLoad={handleLoadChart}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChartGallery; 