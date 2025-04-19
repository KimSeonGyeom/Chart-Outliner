"use client";

import { useRef } from 'react';
import Link from 'next/link';
import ControlPanel from '../components/ControlPanel.jsx';
import AIGenerationSection from '../components/AIGenerationSection.jsx';
import ChartControls from '../components/ChartControls.jsx';
import './page.scss';

export default function Home() {
  // Chart refs
  const chartRef = useRef(null);
  

  return (
    <main className="container">
      <header>
        <span className="main-title">
          Chart Outliner
        </span>
        <Link href="/outputs" className="main-title-link">  
          Gen Outputs
        </Link>
      </header>

      <div className="chart-layout">
        {/* Left side - Chart and chart-specific controls */}
        <div className="chart-section">
          <ControlPanel />
          <ChartControls chartRef={chartRef} />
        </div>
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <AIGenerationSection chartRef={chartRef} />
        </div>
      </div>
    </main>
  );
}
