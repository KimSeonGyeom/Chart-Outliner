"use client";

import React, { useState, useEffect } from 'react';
import LineChart from './LineChart.jsx';
import { 
  ControlPanel, 
  DimensionsSection, 
  AxisSection, 
  DomainSection, 
  LineAppearanceSection, 
  FillSection,
  PointsSection,
  StrokePatternSection,
  ChartDimensions,
  AxisOptions,
  LineChartOptions,
  ChartType,
  SaveDialog,
  downloadChart,
  DataSection
} from '../controls';
import { sampleDataSets, generateRandomLineData } from '../store/dataStore.js';
import { useChartStore } from '../store/chartStore.js';
import '../controls/ControlPanel.scss';
import './LineChartControls.scss';



function LineChartControls({
  data = sampleDataSets.basic,
  width = 512,
  height = 512,
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
  
  // Line chart settings
  const lineSettings = useChartStore(state => state.lineSettings);
  const marginTop = useChartStore(state => state.lineSettings.marginTop);
  const marginRight = useChartStore(state => state.lineSettings.marginRight);
  const marginBottom = useChartStore(state => state.lineSettings.marginBottom);
  const marginLeft = useChartStore(state => state.lineSettings.marginLeft);
  const curveType = useChartStore(state => state.lineSettings.curveType);
  const curveTension = useChartStore(state => state.lineSettings.curveTension);
  const showPoints = useChartStore(state => state.lineSettings.showPoints);
  const pointRadius = useChartStore(state => state.lineSettings.pointRadius);
  const pointShape = useChartStore(state => state.lineSettings.pointShape);
  const lineStrokePattern = useChartStore(state => state.lineSettings.lineStrokePattern);
  const lineStrokeWidth = useChartStore(state => state.lineSettings.lineStrokeWidth);
  const lineStrokeStyle = useChartStore(state => state.lineSettings.lineStrokeStyle);
  const lineDashArray = useChartStore(state => state.lineSettings.lineDashArray);
  
  // Fill settings (shared)
  const fill = useChartStore(state => state.fillSettings.fill);
  const fillPattern = useChartStore(state => state.fillSettings.fillPattern);
  const fillZoomLevel = useChartStore(state => state.fillSettings.fillZoomLevel);
  const fillOpacity = useChartStore(state => state.fillSettings.fillOpacity);
  
  // Chart data
  const chartData = useChartStore(state => state.chartData);
  const selectedPreset = useChartStore(state => state.selectedPreset);
  
  // Axis options
  const axisOptions = useChartStore(state => state.axisOptions);
  
  // Export options
  const exportOptions = useChartStore(state => state.exportOptions);
  
  // Store actions
  const updateLineSettings = useChartStore(state => state.updateLineSettings);
  const setAxisOptions = useChartStore(state => state.setAxisOptions);
  const setChartData = useChartStore(state => state.setChartData);
  const setSelectedPreset = useChartStore(state => state.setSelectedPreset);
  const setExportOptions = useChartStore(state => state.setExportOptions);
  
  // Initialize chart data and dimensions
  React.useEffect(() => {
    if (data !== chartData) {
      setChartData(data);
    }
    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }
  }, [data, chartData, width, height, dimensions, setChartData, setDimensions]);
  
  // Handle dimension change
  const handleDimensionChange = (dimension, value) => {
    setDimensions({ [dimension]: value });
  };
  
  // Handle line option change
  const handleLineOptionChange = (option, value) => {
    updateLineSettings({ [option]: value });
  };
  
  // Handle axis option change
  const handleAxisOptionChange = (option, value) => {
    setAxisOptions({ [option]: value });
  };
  
  // Handle domain change
  const handleDomainChange = (min, max) => {
    setAxisOptions({ yDomainMin: min, yDomainMax: max });
  };
  
  // Get chart config for saving
  const getChartConfig = () => {
    return chartStore.getLineChartConfig();
  };
  
  // Handle chart save
  const handleSaveChart = async () => {
    await saveChart({
      chartRef,
      chartName,
      chartType: 'line',
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
      // Download the chart
      downloadChart(chartRef, exportOptions.exportFileName, exportOptions.exportFileType)
        .then(() => {
          // Close export options after successful export
          setExportOptions({ showExportOptions: false });
        })
        .catch(error => {
          console.error('Error exporting chart:', error);
        });
    }
  };
  
  // Function to generate random data
  const generateRandomData = () => {
    setChartData(generateRandomLineData());
    setSelectedPreset("custom");
  };
  
  // Function to handle preset selection
  const handlePresetChange = (preset) => {
    if (preset === "random") {
      generateRandomData();
    } else if (preset in sampleDataSets && preset !== 'grouped') {
      setChartData(sampleDataSets[preset]);
      setSelectedPreset(preset);
    }
  };

  // Shared controls
  const sharedControls = (
    <>
      <DimensionsSection
        dimensions={dimensions}
        onDimensionChange={handleDimensionChange}
      />
      
      <DataSection
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
        onRandomize={generateRandomData}
        chartType="line"
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
        strokePattern={lineStrokePattern}
        strokeWidth={lineStrokeWidth}
        strokeStyle={lineStrokeStyle}
        dashArray={lineDashArray}
        onStrokePatternChange={(pattern) => handleLineOptionChange('lineStrokePattern', pattern)}
        onStrokeWidthChange={(width) => handleLineOptionChange('lineStrokeWidth', width)}
        onStrokeStyleChange={(style) => handleLineOptionChange('lineStrokeStyle', style)}
        onDashArrayChange={(dashArray) => handleLineOptionChange('lineDashArray', dashArray)}
      />

      <FillSection />
    </>
  );
  
  // Chart-specific controls
  const chartSpecificControls = (
    <>
      <LineAppearanceSection
        curveType={curveType}
        curveTension={curveTension}
        onCurveTypeChange={(type) => handleLineOptionChange('curveType', type)}
        onCurveTensionChange={(tension) => handleLineOptionChange('curveTension', tension)}
      />
      
      <PointsSection
        showPoints={showPoints}
        pointRadius={pointRadius}
        pointShape={pointShape}
        onShowPointsChange={(show) => handleLineOptionChange('showPoints', show)}
        onPointRadiusChange={(radius) => handleLineOptionChange('pointRadius', radius)}
        onPointShapeChange={(shape) => handleLineOptionChange('pointShape', shape)}
      />
    </>
  );

  // Export options component
  const exportOptionsComponent = (
    <div className="export-options-dialog">
      <h3>Export Options</h3>
      
      <label>
        Filename
        <input
          type="text"
          value={exportOptions.exportFileName}
          onChange={(e) => setExportOptions({ exportFileName: e.target.value })}
        />
      </label>
      
      <div className="file-type-options">
        <label>
          <input
            type="radio"
            name="fileType"
            value="png"
            checked={exportOptions.exportFileType === 'png'}
            onChange={() => setExportOptions({ exportFileType: 'png' })}
          />
          PNG
        </label>
        
        <label>
          <input
            type="radio"
            name="fileType"
            value="jpg"
            checked={exportOptions.exportFileType === 'jpg'}
            onChange={() => setExportOptions({ exportFileType: 'jpg' })}
          />
          JPG
        </label>
        
        <label>
          <input
            type="radio"
            name="fileType"
            value="svg"
            checked={exportOptions.exportFileType === 'svg'}
            onChange={() => setExportOptions({ exportFileType: 'svg' })}
          />
          SVG
        </label>
      </div>
      
      <div className="export-actions">
        <button onClick={handleExport}>Export</button>
        <button onClick={() => setExportOptions({ showExportOptions: false })}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="line-chart-wrapper">
      <div className="line-chart-controls">
        {/* Chart display */}
        <div className="chart-container">
          <div ref={chartRef} className="chart-display">
            <LineChart
              data={chartData}
              width={dimensions.width}
              height={dimensions.height}
              marginTop={marginTop}
              marginRight={marginRight}
              marginBottom={marginBottom}
              marginLeft={marginLeft}
              curveType={curveType}
              curveTension={curveTension}
              fill={fill}
              fillPattern={fillPattern}
              fillZoomLevel={fillZoomLevel}
              fillOpacity={fillOpacity}
              lineStrokePattern={lineStrokePattern}
              lineStrokeWidth={lineStrokeWidth}
              lineStrokeStyle={lineStrokeStyle}
              lineDashArray={lineDashArray}
              showPoints={showPoints}
              pointRadius={pointRadius}
              pointShape={pointShape}
              showXAxis={axisOptions.showXAxis}
              showYAxis={axisOptions.showYAxis}
              yDomainMin={axisOptions.yDomainMin}
              yDomainMax={axisOptions.yDomainMax}
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
          sharedControls={sharedControls}
          chartSpecificControls={chartSpecificControls}
          showExportOptions={exportOptions.showExportOptions}
          exportOptions={exportOptionsComponent}
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

export default LineChartControls; 