"use client";

import React, { useState } from 'react';
import BarChartControls from '@/components/charts/BarChartControls';
import LineChartControls from '@/components/charts/LineChartControls';

export default function Home() {
  const [activeChart, setActiveChart] = useState<'bar' | 'line'>('bar');

  return (
    <main className="container mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Chart Outliner</h1>
        <p className="text-gray-600">Create, customize, and save beautiful charts</p>
      </header>

      <div className="chart-selector mb-6 flex justify-center space-x-4">
        <button 
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeChart === 'bar' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveChart('bar')}
        >
          Bar Chart
        </button>
        <button 
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeChart === 'line' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveChart('line')}
        >
          Line Chart
        </button>
      </div>

      <div className="chart-container">
        {activeChart === 'bar' ? (
          <BarChartControls />
        ) : (
          <LineChartControls />
        )}
      </div>
    </main>
  );
}
