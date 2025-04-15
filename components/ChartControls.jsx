"use client";

import BarChart from './BarChart.jsx';
import ExportSection from './ExportSection.jsx';

export default function ChartControls({ chartRef }) {
  return (
    <div>
      <div className="section-title">Export</div>
      
      {/* Export options */}
      <ExportSection chartRef={chartRef} />
      
      {/* Chart display */}
      <div className="chart-display">
        <BarChart ref={chartRef} />
      </div>
    </div>
  );
} 