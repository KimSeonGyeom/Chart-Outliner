"use client";

import React, { useState, useRef } from 'react';
import BarChartControls from '../components/charts/BarChartControls.jsx';
import LineChartControls from '../components/charts/LineChartControls.jsx';

export default function Home() {
  const [activeChart, setActiveChart] = useState('bar');
  const [loadedChart, setLoadedChart] = useState(null);

  // Chart refs
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  // Save chart state
  const [isSaving, setIsSaving] = useState(false);
  const [chartName, setChartName] = useState('');
  
  // Handle loading saved charts
  const handleLoadSavedChart = (chart) => {
    // Update the active chart type based on the loaded chart
    setActiveChart(chart.type);
    // Store the loaded chart to pass to the appropriate controls
    setLoadedChart(chart);
  };

  // Reset loadedChart after it's been used
  const handleChartLoaded = () => {
    setLoadedChart(null);
  };

  return (
    <main className="container mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Chart Outliner</h1>
      </header>

      {/* Active chart controls */}
      <br/>
      <h2 className="text-2xl font-bold mb-4">Current Chart</h2>
      <div className="chart-container">
        {activeChart === 'bar' ? (
          <BarChartControls 
            chartRef={barChartRef}
            activeChart={activeChart}
            onChartTypeChange={setActiveChart}
            isSaving={isSaving}
            chartName={chartName}
            onSaveClick={() => setIsSaving(true)}
            onSaveClose={() => setIsSaving(false)}
            onChartNameChange={setChartName}
            onLoadChart={handleLoadSavedChart}
            loadedChart={loadedChart && loadedChart.type === 'bar' ? loadedChart : null}
            onChartLoaded={handleChartLoaded}
          />
        ) : (
          <LineChartControls 
            chartRef={lineChartRef}
            activeChart={activeChart}
            onChartTypeChange={setActiveChart}
            isSaving={isSaving}
            chartName={chartName}
            onSaveClick={() => setIsSaving(true)}
            onSaveClose={() => setIsSaving(false)}
            onChartNameChange={setChartName}
            onLoadChart={handleLoadSavedChart}
            loadedChart={loadedChart && loadedChart.type === 'line' ? loadedChart : null}
            onChartLoaded={handleChartLoaded}
          />
        )}
      </div>
    </main>
  );
}
