"use client";

import React, { useState, useEffect } from 'react';
import LineChart from './LineChart.jsx';
import { 
  ControlPanel, 
  DimensionsSection, 
  AxisSection, 
  DomainSection, 
  LineAppearanceSection, 
  LineFillSection,
  PointsSection,
  StrokePatternSection,
  ChartDimensions,
  AxisOptions,
  LineChartOptions,
  ChartType,
  SaveDialog,
  downloadChart,
  ExportVariationsButton,
  DataSection
} from '../controls';
import { sampleDataSets, generateRandomLineData } from '../store/dataStore.js';
import '../../styles/components/ControlPanel.scss';
import '../../styles/components/LineChartControls.scss';



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
  onLoadChart,
  loadedChart,
  onChartLoaded
}) {
  const loadedConfig = loadedChart?.config;

  // Chart dimensions
  const [dimensions, setDimensions] = useState({
    width: loadedConfig?.width || width,
    height: loadedConfig?.height || height
  });
  
  const [marginTop, setMarginTop] = useState(20);
  const [marginRight, setMarginRight] = useState(20);
  const [marginBottom, setMarginBottom] = useState(30);
  const [marginLeft, setMarginLeft] = useState(40);
  
  // Line chart specific options
  const [lineOptions, setLineOptions] = useState({
    curveType: loadedConfig?.curveType || 'linear',
    curveTension: loadedConfig?.curveTension || 0.5,
    fill: loadedConfig?.fill || false,
    fillOpacity: loadedConfig?.fillOpacity || 0.0,
    fillPattern: loadedConfig?.fillPattern || 'solid',
    fillZoomLevel: loadedConfig?.fillZoomLevel || 8,
    showPoints: loadedConfig?.showPoints ?? true,
    pointRadius: loadedConfig?.pointRadius ?? 3,
    pointShape: loadedConfig?.pointShape ?? 'circle',
    pointStrokeWidth: loadedConfig?.pointStrokeWidth ?? 1,
    lineStrokePattern: loadedConfig?.lineStrokePattern || 'solid',
    lineStrokeWidth: loadedConfig?.lineStrokeWidth || 1,
    lineStrokeStyle: loadedConfig?.lineStrokeStyle || 'normal',
    lineDashArray: loadedConfig?.lineDashArray || '6,4'
  });
  
  // Axis appearance
  const [axisOptions, setAxisOptions] = useState({
    showXAxis: loadedConfig?.showXAxis || true,
    showYAxis: loadedConfig?.showYAxis || true,
    yDomainMin: loadedConfig?.yDomainMin,
    yDomainMax: loadedConfig?.yDomainMax
  });
  
  // Replace isExporting dialog state with showExportOptions
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  const [exportFileType, setExportFileType] = useState('png');
  
  // Add state for current data
  const [chartData, setChartData] = useState(data);
  const [selectedPreset, setSelectedPreset] = useState("basic");
  
  // Handle dimension change
  const handleDimensionChange = (dimension, value) => {
    setDimensions(prev => ({ ...prev, [dimension]: value }));
  };
  
  // Handle line option change
  const handleLineOptionChange = (option, value) => {
    setLineOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle axis option change
  const handleAxisOptionChange = (option, value) => {
    setAxisOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle domain change
  const handleDomainChange = (min, max) => {
    setAxisOptions(prev => ({ ...prev, yDomainMin: min, yDomainMax: max }));
  };
  
  // Get chart config for saving
  const getChartConfig = () => {
    return {
      width: dimensions.width,
      height: dimensions.height,
      curveType: lineOptions.curveType,
      curveTension: lineOptions.curveTension,
      fill: lineOptions.fill,
      fillOpacity: lineOptions.fillOpacity,
      fillPattern: lineOptions.fillPattern,
      fillZoomLevel: lineOptions.fillZoomLevel,
      showPoints: lineOptions.showPoints,
      pointRadius: lineOptions.pointRadius,
      pointShape: lineOptions.pointShape,
      pointStrokeWidth: lineOptions.pointStrokeWidth,
      lineStrokePattern: lineOptions.lineStrokePattern,
      lineStrokeWidth: lineOptions.lineStrokeWidth,
      lineStrokeStyle: lineOptions.lineStrokeStyle,
      lineDashArray: lineOptions.lineDashArray,
      showXAxis: axisOptions.showXAxis,
      showYAxis: axisOptions.showYAxis,
      yDomainMin: axisOptions.yDomainMin,
      yDomainMax: axisOptions.yDomainMax
    };
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
  
  // Load chart when loadedChart prop changes
  useEffect(() => {
    if (loadedChart && loadedChart.type === 'line') {
      const config = loadedChart.config;
      setDimensions({
        width: config.width,
        height: config.height
      });
      setMarginTop(config.marginTop);
      setMarginRight(config.marginRight);
      setMarginBottom(config.marginBottom);
      setMarginLeft(config.marginLeft);
      setLineOptions({
        curveType: config.curveType,
        curveTension: config.curveTension,
        fill: config.fill,
        fillOpacity: config.fillOpacity,
        fillPattern: config.fillPattern || 'solid',
        fillZoomLevel: config.fillZoomLevel,
        showPoints: config.showPoints,
        pointRadius: config.pointRadius,
        pointShape: config.pointShape ?? 'circle',
        pointStrokeWidth: config.pointStrokeWidth ?? 1,
        lineStrokePattern: config.lineStrokePattern || 'solid',
        lineStrokeWidth: config.lineStrokeWidth,
        lineStrokeStyle: config.lineStrokeStyle || 'normal',
        lineDashArray: config.lineDashArray || '6,4'
      });
      setAxisOptions({
        showXAxis: config.showXAxis,
        showYAxis: config.showYAxis,
        yDomainMin: config.yDomainMin,
        yDomainMax: config.yDomainMax
      });
      
      // Call onChartLoaded callback to reset loadedChart state
      if (onChartLoaded) {
        onChartLoaded();
      }
    }
  }, [loadedChart, onChartLoaded]);

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
  }, [chartData]);

  // Handle export click
  const handleExportClick = () => {
    setExportFileName(chartName || 'chart');
    setShowExportOptions(!showExportOptions);
  };
  
  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      // Download the chart
      downloadChart(chartRef, exportFileName, exportFileType)
        .then(() => {
          // Close export options after successful export
          setShowExportOptions(false);
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
        strokePattern={lineOptions.lineStrokePattern}
        strokeWidth={lineOptions.lineStrokeWidth}
        strokeStyle={lineOptions.lineStrokeStyle}
        dashArray={lineOptions.lineDashArray}
        onStrokePatternChange={(pattern) => handleLineOptionChange('lineStrokePattern', pattern)}
        onStrokeWidthChange={(width) => handleLineOptionChange('lineStrokeWidth', width)}
        onStrokeStyleChange={(style) => handleLineOptionChange('lineStrokeStyle', style)}
        onDashArrayChange={(dashArray) => handleLineOptionChange('lineDashArray', dashArray)}
      />
    </>
  );
  
  // Chart-specific controls
  const chartSpecificControls = (
    <>
      <LineAppearanceSection
        curveType={lineOptions.curveType}
        curveTension={lineOptions.curveTension}
        onCurveTypeChange={(type) => handleLineOptionChange('curveType', type)}
        onCurveTensionChange={(tension) => handleLineOptionChange('curveTension', tension)}
      />
      
      <LineFillSection
        fill={lineOptions.fill}
        fillOpacity={lineOptions.fillOpacity}
        fillPattern={lineOptions.fillPattern}
        fillZoomLevel={lineOptions.fillZoomLevel}
        onFillChange={(fill) => handleLineOptionChange('fill', fill)}
        onFillOpacityChange={(opacity) => handleLineOptionChange('fillOpacity', opacity)}
        onFillPatternChange={(pattern) => handleLineOptionChange('fillPattern', pattern)}
        onFillZoomLevelChange={(zoomLevel) => handleLineOptionChange('fillZoomLevel', zoomLevel)}
      />
      
      <PointsSection
        showPoints={lineOptions.showPoints}
        pointRadius={lineOptions.pointRadius}
        pointShape={lineOptions.pointShape}
        pointStrokeWidth={lineOptions.pointStrokeWidth}
        onShowPointsChange={(show) => handleLineOptionChange('showPoints', show)}
        onPointRadiusChange={(radius) => handleLineOptionChange('pointRadius', radius)}
        onPointShapeChange={(shape) => handleLineOptionChange('pointShape', shape)}
        onPointStrokeWidthChange={(width) => handleLineOptionChange('pointStrokeWidth', width)}
      />

      <div className="section">
        <h3>Export Variations</h3>
        <p>Generate and download multiple variations of this chart</p>
        <ExportVariationsButton
          chartType="line"
          chartRef={chartRef}
          setChartSettings={(settings) => {
            if ('curveType' in settings) {
              handleLineOptionChange('curveType', settings.curveType);
            }
            if ('fill' in settings) {
              handleLineOptionChange('fill', settings.fill);
            }
            if ('data' in settings) {
              setChartData(settings.data);
            }
          }}
        />
      </div>
    </>
  );

  // Export options component
  const exportOptions = (
    <div className="export-options-dialog">
      <h3>Export Options</h3>
      
      <label>
        Filename
        <input
          type="text"
          value={exportFileName}
          onChange={(e) => setExportFileName(e.target.value)}
        />
      </label>
      
      <div className="file-type-options">
        <label>
          <input
            type="radio"
            name="fileType"
            value="png"
            checked={exportFileType === 'png'}
            onChange={() => setExportFileType('png')}
          />
          PNG
        </label>
        
        <label>
          <input
            type="radio"
            name="fileType"
            value="jpg"
            checked={exportFileType === 'jpg'}
            onChange={() => setExportFileType('jpg')}
          />
          JPG
        </label>
        
        <label>
          <input
            type="radio"
            name="fileType"
            value="svg"
            checked={exportFileType === 'svg'}
            onChange={() => setExportFileType('svg')}
          />
          SVG
        </label>
      </div>
      
      <div className="export-actions">
        <button onClick={handleExport}>Export</button>
        <button onClick={() => setShowExportOptions(false)}>Cancel</button>
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
              curveType={lineOptions.curveType}
              curveTension={lineOptions.curveTension}
              fill={lineOptions.fill}
              fillOpacity={lineOptions.fillOpacity}
              fillPattern={lineOptions.fillPattern}
              fillZoomLevel={lineOptions.fillZoomLevel}
              lineStrokePattern={lineOptions.lineStrokePattern}
              lineStrokeWidth={lineOptions.lineStrokeWidth}
              lineStrokeStyle={lineOptions.lineStrokeStyle}
              lineDashArray={lineOptions.lineDashArray}
              showPoints={lineOptions.showPoints}
              pointRadius={lineOptions.pointRadius}
              pointShape={lineOptions.pointShape}
              pointStrokeWidth={lineOptions.pointStrokeWidth}
              showXAxis={axisOptions.showXAxis}
              showYAxis={axisOptions.showYAxis}
              yDomainMin={axisOptions.yDomainMin}
              yDomainMax={axisOptions.yDomainMax}
              onResize={(newWidth, newHeight) => {
                handleDimensionChange('width', newWidth);
                handleDimensionChange('height', newHeight);
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
          showExportOptions={showExportOptions}
          exportOptions={exportOptions}
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