"use client";

import React, { useRef } from 'react';
import BarChart from '../components/charts/BarChart.jsx';
import LineChart from '../components/charts/LineChart.jsx';
import DiamondTemplate from '../components/templates/DiamondTemplate.jsx';
import TriangleTemplate from '../components/templates/TriangleTemplate.jsx';
import RectangleTemplate from '../components/templates/RectangleTemplate.jsx';
import CircleTemplate from '../components/templates/CircleTemplate.jsx';
import { useSharedStore } from '../components/store/sharedStore.js';
import { useChartStore } from '../components/store/chartStore.js';
import { useDataStore } from '../components/store/dataStore.js';
import { 
  ControlPanel,
  downloadChart
} from '../components/controls';
import './page.scss';

// Chart component that renders the appropriate chart based on chartType
const ChartDisplay = ({ chartType, chartRef }) => {
  // Shared store properties (used by both chart types)
  const width = useSharedStore(state => state.width);
  const height = useSharedStore(state => state.height);
  const showXAxis = useSharedStore(state => state.showXAxis);
  const showYAxis = useSharedStore(state => state.showYAxis);
  const yDomainMin = useSharedStore(state => state.yDomainMin);
  const yDomainMax = useSharedStore(state => state.yDomainMax);
  const fill = useSharedStore(state => state.fill);
  const fillPattern = useSharedStore(state => state.fillPattern);
  const fillZoomLevel = useSharedStore(state => state.fillZoomLevel);
  const fillOpacity = useSharedStore(state => state.fillOpacity);
  const updateSetting = useSharedStore(state => state.updateSetting);
  
  // Data store properties
  const chartData = useDataStore(state => state.chartData);
  
  // Use all chart store properties regardless of chart type to avoid hook inconsistency
  // Bar chart specific properties
  const barPadding = useChartStore(state => state.barPadding);
  const barStrokePattern = useChartStore(state => state.barStrokePattern);
  const barStrokeWidth = useChartStore(state => state.barStrokeWidth);
  const barDashArray = useChartStore(state => state.barDashArray);
  const barStrokeColor = useChartStore(state => state.barStrokeColor);
  const selectedTemplate = useChartStore(state => state.selectedTemplate);
  
  // Line chart specific properties
  const curveType = useChartStore(state => state.curveType);
  const curveTension = useChartStore(state => state.curveTension);
  const showPoints = useChartStore(state => state.showPoints);
  const pointRadius = useChartStore(state => state.pointRadius);
  const pointShape = useChartStore(state => state.pointShape);
  const lineStrokePattern = useChartStore(state => state.lineStrokePattern);
  const lineStrokeWidth = useChartStore(state => state.lineStrokeWidth);
  const lineDashArray = useChartStore(state => state.lineDashArray);
  const lineColor = useChartStore(state => state.lineColor);
  const pointStroke = useChartStore(state => state.pointStroke);
  const pointStrokeWidth = useChartStore(state => state.pointStrokeWidth);
    
  // Template mapping
  const templates = {
    'none': null,
    'rectangle': RectangleTemplate,
    'circle': CircleTemplate,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };
  
  if (chartType === 'bar') {
    return (
      <div ref={chartRef} className="chart-display">
        <BarChart 
          data={chartData}
          width={width} 
          height={height}
          barPadding={barPadding}
          barFill={fill}
          barFillPattern={fillPattern}
          barFillZoomLevel={fillZoomLevel}
          barFillOpacity={fillOpacity}
          barStrokePattern={barStrokePattern}
          barStrokeWidth={barStrokeWidth}
          barDashArray={barDashArray}
          barStrokeColor={barStrokeColor}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          yDomainMin={yDomainMin}
          yDomainMax={yDomainMax}
          template={templates[selectedTemplate]}
          onResize={(newWidth, newHeight) => {
            updateSetting('width', newWidth);
            updateSetting('height', newHeight);
          }}
        />
      </div>
    );
  } else {
    return (
      <div ref={chartRef} className="chart-display">
        <LineChart
          data={chartData}
          width={width}
          height={height}
          curveType={curveType}
          curveTension={curveTension}
          fill={fill}
          fillPattern={fillPattern}
          fillZoomLevel={fillZoomLevel}
          fillOpacity={fillOpacity}
          lineStrokePattern={lineStrokePattern}
          lineStrokeWidth={lineStrokeWidth}
          lineDashArray={lineDashArray}
          lineColor={lineColor}
          showPoints={showPoints}
          pointRadius={pointRadius}
          pointShape={pointShape}
          pointStroke={pointStroke}
          pointStrokeWidth={pointStrokeWidth}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          yDomainMin={yDomainMin}
          yDomainMax={yDomainMax}
          onResize={(newWidth, newHeight) => {
            updateSetting('width', newWidth);
            updateSetting('height', newHeight);
          }}
        />
      </div>
    );
  }
};

export default function Home() {
  const chartType = useSharedStore(state => state.chartType);
  const setChartType = useSharedStore(state => state.setChartType);
  const showExportOptions = useChartStore(state => state.showExportOptions);
  const exportFileName = useChartStore(state => state.exportFileName);
  const exportFileType = useChartStore(state => state.exportFileType);
  const updateSetting = useChartStore(state => state.updateSetting);
  
  // Chart refs
  const chartRef = useRef(null);
  
  // Handle export click
  const handleExportClick = () => {
    updateSetting('showExportOptions', !showExportOptions);
  };
  
  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      // Download the chart
      downloadChart(chartRef, exportFileName, exportFileType)
        .then(() => {
          // Close export options after successful export
          updateSetting('showExportOptions', false);
        })
        .catch(error => {
          console.error('Error exporting chart:', error);
        });
    }
  };
  
  // Export options component based on chart type
  const exportOptionsComponent = (
    <div className={`export-options ${chartType === 'bar' ? 'bar-export' : 'line-export'}`}>
      <div className="export-title">Export Options</div>
      
      <div className="form-group">
        <label htmlFor="fileName">File Name</label>
        <input
          id="fileName"
          type="text"
          value={exportFileName}
          onChange={(e) => updateSetting('exportFileName', e.target.value)}
          placeholder="Enter a name for your file"
        />
      </div>
      
      <div className="form-group">
        <label>File Format</label>
        <div className="format-options">
          {['png', 'jpg', 'svg'].map((format) => (
            <div 
              key={format}
              className={`format-option ${exportFileType === format ? 'selected' : ''}`}
              onClick={() => updateSetting('exportFileType', format)}
            >
              <div className="format-radio">
                <div className="radio-inner"></div>
              </div>
              <span className="format-label">{format.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="export-actions">
        <button 
          className="cancel-button"
          onClick={() => updateSetting('showExportOptions', false)}
        >
          Cancel
        </button>
        <button 
          className="export-button"
          onClick={handleExport}
        >
          Export
        </button>
      </div>
    </div>
  );

  return (
    <main className="container">
      <header>
        <div className="main-title">Chart Outliner</div>
      </header>

      <div className="chart-layout">
        {/* Left side - Chart and chart-specific controls */}
        <div className="chart-section">
          <div className="section-title">Current Chart</div>
          {/* Chart display */}
          <div className="chart-display-container">
            <ChartDisplay chartType={chartType} chartRef={chartRef} />
          </div>
        </div>
        
        {/* Right side - Control Panel */}
        <div className="control-section">
          <ControlPanel
            chartType={chartType}
            onChartTypeChange={setChartType}
            onExportClick={handleExportClick}
            showExportOptions={showExportOptions}
            exportOptions={exportOptionsComponent}
          />
        </div>
      </div>
    </main>
  );
}
