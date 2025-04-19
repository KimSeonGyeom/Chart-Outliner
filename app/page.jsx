"use client";

import React from 'react';
import { useUIStore } from '../components/store/uiStore';
import HomePage from '../components/HomePage';
import OutputsPage from '../components/OutputsPage';
import AnalysisPage from '../components/AnalysisPage';
import './page.scss';

export default function Home() {
  const { currentPage, navigateTo } = useUIStore();

  // Render the appropriate page based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'outputs':
        return <OutputsPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <main className="container">
      <header>
        <span 
          className={`main-title-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          Chart Outliner
        </span>
        <span 
          className={`main-title-link ${currentPage === 'outputs' ? 'active' : ''}`}
          onClick={() => navigateTo('outputs')}
        >  
          Gen Outputs
        </span>
        <span 
          className={`main-title-link ${currentPage === 'analysis' ? 'active' : ''}`}
          onClick={() => navigateTo('analysis')}
        >  
          Analysis
        </span>
      </header>

      {renderCurrentPage()}
    </main>
  );
}
