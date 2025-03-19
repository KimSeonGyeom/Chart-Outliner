"use client";

import React from 'react';
import LineChartControls from '@/components/charts/LineChartControls';

export default function LineChartDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Line Chart Parameter Playground</h1>
      <p className="mb-6">Use the controls on the right to customize the spline curve and chart appearance.</p>
      
      <LineChartControls />
    </div>
  );
} 