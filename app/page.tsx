"use client";

import React, { useState, useRef } from 'react';
import BarChartControls from '@/components/charts/BarChartControls';
import LineChartControls from '@/components/charts/LineChartControls';
import { ChartType } from '@/components/controls';
import ChartGallery from '@/components/gallery/ChartGallery';
import { SavedChartData } from '@/components/gallery/types';

export default function Home() {
  const [activeChart, setActiveChart] = useState<ChartType>('bar');
  const [loadedChart, setLoadedChart] = useState<SavedChartData | null>(null);

  // Chart refs
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  
  // Save chart state
  const [isSaving, setIsSaving] = useState(false);
  const [chartName, setChartName] = useState('');
  
  // Handle loading saved charts
  const handleLoadSavedChart = (chart: SavedChartData) => {
    // Update the active chart type based on the loaded chart
    setActiveChart(chart.type);
    // Store the loaded chart to pass to the appropriate controls
    setLoadedChart(chart);
  };

  // Reset loadedChart after it has been applied
  const handleChartLoaded = () => {
    setLoadedChart(null);
  };

  return (
    <main className="container mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Chart Outliner</h1>
      </header>

      {/* Shared chart gallery */}
      <ChartGallery onLoadChart={handleLoadSavedChart} />

      {/* Active chart controls */}
      <br/>
      <h2 className="text-2xl font-bold mb-4">Current Chart</h2>
      <div className="chart-container">
        {activeChart === 'bar' ? (
          <BarChartControls 
            chartRef={barChartRef as React.RefObject<HTMLDivElement>}
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
            chartRef={lineChartRef as React.RefObject<HTMLDivElement>}
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
