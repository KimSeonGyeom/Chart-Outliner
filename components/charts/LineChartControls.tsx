"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChartData } from '../templates/types';
import LineChart from './LineChart';
import { SavedChartData, LineChartConfig } from '../gallery/types';
import { 
  ControlPanel, 
  DimensionsSection, 
  AxisSection, 
  DomainSection, 
  LineAppearanceSection, 
  LineFillSection,
  PointsSection,
  ChartDimensions,
  AxisOptions,
  LineChartOptions,
  ChartType,
  SaveDialog,
  saveChart,
  downloadChart
} from '../controls';
import '../../styles/components/ControlPanel.scss';
import '../../styles/components/LineChartControls.scss';

// Sample data for demonstration
const sampleData: ChartData = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 50 },
  { x: 'Mar', y: 20 },
  { x: 'Apr', y: 40 },
  { x: 'May', y: 70 },
  { x: 'Jun', y: 60 },
  { x: 'Jul', y: 80 },
];

interface LineChartControlsProps {
  data?: ChartData;
  width?: number;
  height?: number;
  chartRef: React.RefObject<HTMLDivElement>;
  activeChart: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  isSaving: boolean;
  chartName: string;
  onSaveClick: () => void;
  onSaveClose: () => void;
  onChartNameChange: (name: string) => void;
  onLoadChart?: (chart: SavedChartData) => void;
  loadedChart?: SavedChartData | null;
  onChartLoaded?: () => void;
}

function LineChartControls({
  data = sampleData,
  width = 600,
  height = 400,
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
}: LineChartControlsProps) {
  const loadedConfig = loadedChart?.config as LineChartConfig;

  // Chart dimensions
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: loadedConfig?.width || width,
    height: loadedConfig?.height || height
  });
  
  const [marginTop, setMarginTop] = useState(20);
  const [marginRight, setMarginRight] = useState(20);
  const [marginBottom, setMarginBottom] = useState(30);
  const [marginLeft, setMarginLeft] = useState(40);
  
  // Line chart specific options
  const [lineOptions, setLineOptions] = useState<LineChartOptions>({
    curveType: loadedConfig?.curveType || 'cardinal',
    curveTension: loadedConfig?.curveTension || 0.5,
    fill: loadedConfig?.fill || true,
    fillOpacity: loadedConfig?.fillOpacity || 0.3,
    showPoints: loadedConfig?.showPoints || true,
    pointRadius: loadedConfig?.pointRadius || 4
  });
  
  // Axis appearance
  const [axisOptions, setAxisOptions] = useState<AxisOptions>({
    showXAxis: loadedConfig?.showXAxis || true,
    showYAxis: loadedConfig?.showYAxis || true,
    yDomainMin: loadedConfig?.yDomainMin,
    yDomainMax: loadedConfig?.yDomainMax
  });
  
  // Replace isExporting dialog state with showExportOptions
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  const [exportFileType, setExportFileType] = useState<'png' | 'jpg' | 'svg'>('png');
  const [exportWithBg, setExportWithBg] = useState(true);
  
  // Export options
  const [isExporting, setIsExporting] = useState(false);
  const [fileName, setFileName] = useState(chartName || 'chart');
  const [asOutlines, setAsOutlines] = useState(false);
  const [wireframeStyle, setWireframeStyle] = useState<boolean>(false);
  
  // Handle dimension change
  const handleDimensionChange = (dimension: keyof ChartDimensions, value: number) => {
    setDimensions(prev => ({ ...prev, [dimension]: value }));
  };
  
  // Handle line option change
  const handleLineOptionChange = <K extends keyof LineChartOptions>(
    option: K, 
    value: LineChartOptions[K]
  ) => {
    setLineOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle axis option change
  const handleAxisOptionChange = (option: keyof AxisOptions, value: boolean | number | undefined) => {
    setAxisOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle domain change
  const handleDomainChange = (min: number | undefined, max: number | undefined) => {
    setAxisOptions(prev => ({ ...prev, yDomainMin: min, yDomainMax: max }));
  };
  
  // Get chart config for saving
  const getChartConfig = (): LineChartConfig => {
    return {
      width: dimensions.width,
      height: dimensions.height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      curveType: lineOptions.curveType,
      curveTension: lineOptions.curveTension,
      fill: lineOptions.fill,
      fillOpacity: lineOptions.fillOpacity,
      showPoints: lineOptions.showPoints,
      pointRadius: lineOptions.pointRadius,
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
      const config = loadedChart.config as LineChartConfig;
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
        showPoints: config.showPoints,
        pointRadius: config.pointRadius
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

  // Handle export click
  const handleExportClick = () => {
    setExportFileName(chartName || 'chart');
    setShowExportOptions(!showExportOptions);
  };
  
  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      // Download the chart
      downloadChart(chartRef, exportFileName, exportFileType, exportWithBg, wireframeStyle)
        .then(() => {
          // Close export options after successful export
          setShowExportOptions(false);
        })
        .catch(error => {
          console.error('Error exporting chart:', error);
        });
    }
  };
  
  // Shared controls
  const sharedControls = (
    <>
      <DimensionsSection
        dimensions={dimensions}
        onDimensionChange={handleDimensionChange}
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
        onFillChange={(fill) => handleLineOptionChange('fill', fill)}
        onFillOpacityChange={(opacity) => handleLineOptionChange('fillOpacity', opacity)}
      />
      
      <PointsSection
        showPoints={lineOptions.showPoints}
        pointRadius={lineOptions.pointRadius}
        onShowPointsChange={(show) => handleLineOptionChange('showPoints', show)}
        onPointRadiusChange={(radius) => handleLineOptionChange('pointRadius', radius)}
      />
    </>
  );

  // Export options component
  const exportOptions = (
    <div className="export-options">
      <div className="form-group">
        <label htmlFor="fileName">File Name</label>
        <input
          id="fileName"
          type="text"
          value={exportFileName}
          onChange={(e) => setExportFileName(e.target.value)}
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
              onClick={() => setExportFileType(format as 'png' | 'jpg' | 'svg')}
            >
              <div className="format-radio">
                <div className="radio-inner"></div>
              </div>
              <span className="format-label">{format.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group outline-option">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={exportWithBg}
            onChange={(e) => setExportWithBg(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span>Save with white background</span>
        </label>
      </div>
      
      <div className="form-group outline-option">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={wireframeStyle}
            onChange={(e) => setWireframeStyle(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span>Wireframe Style (black outline, white background)</span>
        </label>
      </div>
      
      <div className="export-actions">
        <button 
          className="cancel-button"
          onClick={() => setShowExportOptions(false)}
        >
          Cancel
        </button>
        <button 
          className="export-button"
          onClick={handleExport}
          disabled={!exportFileName.trim()}
        >
          Export
        </button>
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
              data={data}
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
              showPoints={lineOptions.showPoints}
              pointRadius={lineOptions.pointRadius}
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
      <SaveDialog
        isOpen={isSaving}
        chartName={chartName}
        onClose={onSaveClose}
        onSave={handleSaveChart}
        onChartNameChange={onChartNameChange}
      />
    </div>
  );
};

export default LineChartControls; 