import React, { useState, useEffect } from 'react';
import SavedChart from './SavedChart';
import { SavedChartData } from './types';
import '../../styles/components/ChartGallery.scss';

interface ChartGalleryProps {
  onLoadChart: (chart: SavedChartData) => void;
}

const ChartGallery: React.FC<ChartGalleryProps> = ({ onLoadChart }) => {
  const [savedCharts, setSavedCharts] = useState<SavedChartData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved charts from localStorage
  useEffect(() => {
    const storedCharts = localStorage.getItem('savedCharts');
    if (storedCharts) {
      try {
        const parsedCharts = JSON.parse(storedCharts);
        setSavedCharts(parsedCharts);
      } catch (error) {
        console.error('Error parsing saved charts:', error);
      }
    }
  }, []);

  const handleDeleteChart = (id: string) => {
    const updatedCharts = savedCharts.filter(chart => chart.id !== id);
    setSavedCharts(updatedCharts);
    localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
  };

  const handleLoadChart = (chart: SavedChartData) => {
    onLoadChart(chart);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className="gallery-toggle-button" onClick={() => setIsOpen(true)}>
        Open Gallery
      </button>
    );
  }

  return (
    <div className="chart-gallery">
      <div className="gallery-header">
        <h2>Saved Charts</h2>
        <button className="close-button" onClick={() => setIsOpen(false)}>Close</button>
      </div>
      
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
  );
};

export default ChartGallery; 