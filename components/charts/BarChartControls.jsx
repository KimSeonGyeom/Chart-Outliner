"use client";

import React, { useState, useEffect } from 'react';
import BarChart from './BarChart.jsx';
import DiamondTemplate from '../templates/DiamondTemplate.jsx';
import TriangleTemplate from '../templates/TriangleTemplate.jsx';
import RectangleTemplate from '../templates/RectangleTemplate.jsx';
import CircleTemplate from '../templates/CircleTemplate.jsx';
import { 
  ControlPanel, 
  DimensionsSection, 
  AxisSection, 
  DomainSection, 
  BarTemplateSection, 
  BarAppearanceSection,
  StrokePatternSection,
  FillSection,
  ChartDimensions,
  AxisOptions,
  ChartType,
  SaveDialog,
  downloadChart,
  DataSection
} from '../controls';
import { sampleDataSets, generateRandomBarData, generateTrendData } from '../store/dataStore.js';
import { useChartStore } from '../store/chartStore.js';
import '../controls/ControlPanel.scss';
import './BarChartControls.scss';



// Define a BarOptions type that includes all bar-related options


function BarChartControls({
  data = sampleDataSets.basic,
  chartRef,
  activeChart,
  onChartTypeChange,
  isSaving,
  chartName,
  onSaveClick,
  onSaveClose,
  onChartNameChange,
}) {
  // Get all settings from the chart store
  const chartStore = useChartStore();
  
  // Dimensions
  const dimensions = useChartStore(state => state.dimensions);
  const setDimensions = useChartStore(state => state.setDimensions);
  
  // Bar appearance settings
  const barPadding = useChartStore(state => state.barSettings.barPadding);
  const barStrokePattern = useChartStore(state => state.barSettings.barStrokePattern);
  const barStrokeWidth = useChartStore(state => state.barSettings.barStrokeWidth);
  const barStrokeStyle = useChartStore(state => state.barSettings.barStrokeStyle);
  const barDashArray = useChartStore(state => state.barSettings.barDashArray);
  const selectedTemplate = useChartStore(state => state.barSettings.selectedTemplate);
  
  // Fill settings (shared)
  const fill = useChartStore(state => state.fillSettings.fill);
  const fillPattern = useChartStore(state => state.fillSettings.fillPattern);
  const fillZoomLevel = useChartStore(state => state.fillSettings.fillZoomLevel);
  
  // Chart data
  const chartData = useChartStore(state => state.chartData);
  const selectedPreset = useChartStore(state => state.selectedPreset);
  
  // Axis options
  const axisOptions = useChartStore(state => state.axisOptions);
  
  // Export options
  const exportOptions = useChartStore(state => state.exportOptions);
  
  // Store actions
  const updateBarSettings = useChartStore(state => state.updateBarSettings);
  const setAxisOptions = useChartStore(state => state.setAxisOptions);
  const setChartData = useChartStore(state => state.setChartData);
  const setSelectedPreset = useChartStore(state => state.setSelectedPreset);
  const setExportOptions = useChartStore(state => state.setExportOptions);
  const updateFillSettings = useChartStore(state => state.updateFillSettings);
  
  // Initialize chart data
  React.useEffect(() => {
    if (data !== chartData) {
      setChartData(data);
    }
  }, [data, chartData, setChartData]);

  // Template mapping
  const templates = {
    'none': null,
    'rectangle': RectangleTemplate,
    'circle': CircleTemplate,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };
  
  // Handle dimension change
  const handleDimensionChange = (dimension, value) => {
    setDimensions({ [dimension]: value });
  };
  
  // Update the handleBarOptionChange function to use the store
  const handleBarOptionChange = (option, value) => {
    // Update the appropriate setting in the store
    switch(option) {
      case 'barStrokePattern':
        updateBarSettings({ barStrokePattern: value });
        break;
      case 'barStrokeWidth':
        updateBarSettings({ barStrokeWidth: value });
        break;
      case 'barStrokeStyle':
        updateBarSettings({ barStrokeStyle: value });
        break;
      case 'barDashArray':
        updateBarSettings({ barDashArray: value });
        break;
      case 'selectedTemplate':
        updateBarSettings({ selectedTemplate: value });
        break;
      case 'barPadding':
        updateBarSettings({ barPadding: value });
        break;
      // Add other options
    }
  };
  
  // Handle axis option change
  const handleAxisOptionChange = (option, value) => {
    setAxisOptions({ [option]: value });
  };
  
  // Handle domain change
  const handleDomainChange = (min, max) => {
    setAxisOptions({ yDomainMin: min, yDomainMax: max });
  };
  
  // Function to generate random data
  const generateRandomData = () => {
    const newData = generateRandomBarData();
    setChartData(newData);
    setSelectedPreset("custom");
  };
  
  // Add function to handle preset selection
  const handlePresetChange = (preset) => {
    if (preset === "random") {
      generateRandomData();
    } else if (preset in sampleDataSets && preset !== 'grouped') {
      setChartData(sampleDataSets[preset]);
      setSelectedPreset(preset);
    } else if (['exponential', 'logarithmic', 'sinusoidal'].includes(preset)) {
      // Generate special trends for bar chart with category labels
      const trendData = generateTrendData(
        preset,
        5, // Fewer data points for bar charts
        true // Use categories instead of months
      );
      setChartData(trendData);
      setSelectedPreset(preset);
    }
  };
  
  // Get chart config for saving
  const getChartConfig = () => {
    return chartStore.getBarChartConfig();
  };
  
  // Handle chart save
  const handleSaveChart = async () => {
    await saveChart({
      chartRef,
      chartName,
      chartType: 'bar',
      getChartConfig,
      onSaveSuccess: () => {
        onSaveClose();
      },
      onSaveError: (error) => {
        console.error('Error saving chart:', error);
        alert('Failed to save chart. Please try again.');
        onSaveClose();
      }
    });
  };
  
  // Use a useEffect to set the selectedPreset based on the data
  useEffect(() => {
    // Check if the current data matches a preset
    for (const [key, value] of Object.entries(sampleDataSets)) {
      if (key !== 'grouped' && JSON.stringify(chartData) === JSON.stringify(value)) {
        setSelectedPreset(key);
        return;
      }
    }
    // If no match or matches 'grouped', set to custom or basic
    if (JSON.stringify(chartData) === JSON.stringify(sampleDataSets.grouped)) {
      setChartData(sampleDataSets.basic);
      setSelectedPreset('basic');
    } else {
      setSelectedPreset('custom');
    }
  }, [chartData, setChartData, setSelectedPreset]);

  // Handle export click
  const handleExportClick = () => {
    setExportOptions({ 
      exportFileName: chartName || 'chart',
      showExportOptions: !exportOptions.showExportOptions 
    });
  };
  
  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      const originalFill = fill;
      const originalXAxis = axisOptions.showXAxis;
      const originalYAxis = axisOptions.showYAxis;
      const originalStrokePattern = barStrokePattern;
      
      const regularExport = downloadChart(chartRef, exportOptions.exportFileName, exportOptions.exportFileType);
      
      let segmentExport = Promise.resolve();
      if (!originalFill) {
        updateFillSettings({ fill: true });
        setAxisOptions({ showXAxis: false, showYAxis: false });
        updateBarSettings({ barStrokePattern: 'solid' });

        segmentExport = new Promise(resolve => {
          setTimeout(() => {
            downloadChart(chartRef, `${exportOptions.exportFileName}-segment`, exportOptions.exportFileType)
              .then(() => {
                updateFillSettings({ fill: originalFill });
                setAxisOptions({ showXAxis: originalXAxis, showYAxis: originalYAxis });
                updateBarSettings({ barStrokePattern: originalStrokePattern });
                resolve();
              })
              .catch(error => {
                console.error('Error exporting chart segment:', error);
                updateFillSettings({ fill: originalFill });
                setAxisOptions({ showXAxis: originalXAxis, showYAxis: originalYAxis });
                updateBarSettings({ barStrokePattern: originalStrokePattern });
                resolve();
              });
          }, 100);
        });
      }
      
      Promise.all([regularExport, segmentExport])
        .then(() => { setExportOptions({ showExportOptions: false }); })
        .catch(error => { console.error('Error during export process:', error); });
    }
  };

  return (
    <div className="bar-chart-wrapper">
      <div className="bar-chart-controls">
        {/* Chart display */}
        <div className="chart-container">
          <div ref={chartRef} className="chart-display">
            <BarChart 
              data={chartData}
              width={dimensions.width} 
              height={dimensions.height}
              barPadding={barPadding}
              barFill={fill}
              barFillPattern={fillPattern}
              barFillZoomLevel={fillZoomLevel}
              barStrokePattern={barStrokePattern}
              barStrokeWidth={barStrokeWidth}
              barStrokeStyle={barStrokeStyle}
              barDashArray={barDashArray}
              showXAxis={axisOptions.showXAxis}
              showYAxis={axisOptions.showYAxis}
              yDomainMin={axisOptions.yDomainMin}
              yDomainMax={axisOptions.yDomainMax}
              template={templates[selectedTemplate]}
              onResize={(newWidth, newHeight) => {
                setDimensions({ width: newWidth, height: newHeight });
              }}
            />
          </div>
        </div>
        
        {/* Controls panel */}
        <ControlPanel 
          chartType={activeChart}
          onChartTypeChange={onChartTypeChange}
          onSaveClick={onSaveClick}
          onExportClick={handleExportClick}
          sharedControls={
            <>
              <DimensionsSection 
                dimensions={dimensions}
                onDimensionChange={handleDimensionChange}
              />
              
              <DataSection
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
                onRandomize={generateRandomData}
                chartType="bar"
              />
              
              <AxisSection 
                axisOptions={axisOptions}
                onAxisOptionChange={handleAxisOptionChange}
              />
              
              <DomainSection 
                yDomainMin={axisOptions.yDomainMin}
                yDomainMax={axisOptions.yDomainMax}
                onDomainChange={handleDomainChange}
              />
              
              <StrokePatternSection
                strokePattern={barStrokePattern}
                strokeWidth={barStrokeWidth}
                strokeStyle={barStrokeStyle}
                dashArray={barDashArray}
                onStrokePatternChange={(pattern) => handleBarOptionChange('barStrokePattern', pattern)}
                onStrokeWidthChange={(width) => handleBarOptionChange('barStrokeWidth', width)}
                onStrokeStyleChange={(style) => handleBarOptionChange('barStrokeStyle', style)}
                onDashArrayChange={(dash) => handleBarOptionChange('barDashArray', dash)}
              />

              <FillSection />
            </>
          }
          chartSpecificControls={
            <>
              <BarTemplateSection 
                selectedTemplate={selectedTemplate}
                onTemplateChange={(value) => handleBarOptionChange('selectedTemplate', value)}
              />
              
              <BarAppearanceSection />
            </>
          }
          showExportOptions={exportOptions.showExportOptions}
          exportOptions={
            <div className="export-options">
              <div className="form-group">
                <label htmlFor="fileName">File Name</label>
                <input
                  id="fileName"
                  type="text"
                  value={exportOptions.exportFileName}
                  onChange={(e) => setExportOptions({ exportFileName: e.target.value })}
                  placeholder="Enter a name for your file"
                />
              </div>
              
              <div className="form-group">
                <label>File Format</label>
                <div className="format-options">
                  {['png', 'jpg', 'svg'].map((format) => (
                    <div 
                      key={format}
                      className={`format-option ${exportOptions.exportFileType === format ? 'selected' : ''}`}
                      onClick={() => setExportOptions({ exportFileType: format })}
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
                  onClick={() => setExportOptions({ showExportOptions: false })}
                >
                  Cancel
                </button>
                <button 
                  className="export-button"
                  onClick={handleExport}
                  disabled={!exportOptions.exportFileName.trim()}
                >
                  Export
                </button>
              </div>
            </div>
          }
        />
      </div>
      
      {/* Save dialog */}
      {isSaving && (
        <SaveDialog
          isOpen={isSaving}
          chartName={chartName}
          onClose={onSaveClose}
          onSave={handleSaveChart}
          onChartNameChange={onChartNameChange}
        />
      )}
    </div>
  );
}

export default BarChartControls;