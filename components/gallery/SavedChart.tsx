import React from 'react';
import { SavedChartData } from './types';

interface SavedChartProps {
  chart: SavedChartData;
  onDelete: (id: string) => void;
  onLoad: (chart: SavedChartData) => void;
}

function SavedChart({ chart, onDelete, onLoad }: SavedChartProps) {
  return (
    <div className="saved-chart">
      <div className="chart-thumbnail">
        <img src={chart.imageUrl} alt={chart.name} />
      </div>
      <div className="chart-info">
        <h3>{chart.name}</h3>
        <p className="chart-timestamp">{new Date(chart.timestamp).toLocaleString()}</p>
        <p className="chart-type">{chart.type}</p>
      </div>
      <div className="chart-actions">
        <button 
          className="load-button"
          onClick={() => onLoad(chart)}
          aria-label="Load chart"
        >
          Load
        </button>
        <button 
          className="delete-button"
          onClick={() => onDelete(chart.id)}
          aria-label="Delete chart"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default SavedChart; 