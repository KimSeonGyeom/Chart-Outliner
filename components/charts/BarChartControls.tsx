"use client";

import React, { useState, useEffect } from 'react';
import { ChartData } from '../templates/types';
import BarChart from './BarChart';
import DiamondTemplate from '../templates/DiamondTemplate';
import TriangleTemplate from '../templates/TriangleTemplate';
import RectangleTemplate from '../templates/RectangleTemplate';
import CircleTemplate from '../templates/CircleTemplate';
import { SavedChartData, BarChartConfig } from '../gallery/types';
import { 
  ControlPanel, 
  DimensionsSection, 
  AxisSection, 
  DomainSection, 
  BarTemplateSection, 
  BarAppearanceSection,
  StrokePatternSection,
  ChartDimensions,
  AxisOptions,
  ChartType,
  SaveDialog,
  saveChart,
  downloadChart,
  ExportVariationsButton,
  DataSection
} from '../controls';
import { sampleDataSets, generateRandomBarData, generateTrendData } from '../data';
import '../../styles/components/ControlPanel.scss';
import '../../styles/components/BarChartControls.scss';

interface BarChartControlsProps {
  data?: ChartData;
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

// Define a BarOptions type that includes all bar-related options
interface BarOptions {
  barPadding?: number;
  barColor?: string;
  barStrokeColor?: string;
  barStrokeWidth?: number;
  barFill?: boolean;
  barFillOpacity?: number;
  barFillPattern?: string;
  barFillZoomLevel?: number;
  barStrokePattern?: string;
  barStrokeStyle?: string;
  barDashArray?: string;
}

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
  onLoadChart,
  loadedChart,
  onChartLoaded
}: BarChartControlsProps) {
  const loadedConfig = loadedChart?.config as BarChartConfig;
  
  // Chart dimensions
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: loadedConfig?.width || 512,
    height: loadedConfig?.height || 512
  });
  
  // Bar appearance
  const [barPadding, setBarPadding] = useState(loadedConfig?.barPadding || 0.2);
  const [barFill, setBarFill] = useState(loadedConfig?.barFill || false);
  const [barFillOpacity, setBarFillOpacity] = useState(loadedConfig?.barFillOpacity || 0.5);
  const [barStrokePattern, setBarStrokePattern] = useState(loadedConfig?.barStrokePattern || 'solid');
  const [barFillPattern, setBarFillPattern] = useState(loadedConfig?.barFillPattern || 'solid');
  const [barFillZoomLevel, setBarFillZoomLevel] = useState(loadedConfig?.barFillZoomLevel || 8);
  const [barStrokeWidth, setBarStrokeWidth] = useState(loadedConfig?.barStrokeWidth || 1);
  const [barStrokeStyle, setBarStrokeStyle] = useState(loadedConfig?.barStrokeStyle || 'normal');
  const [barDashArray, setBarDashArray] = useState(loadedConfig?.barDashArray || '6,4');
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>(loadedConfig?.selectedTemplate || 'rectangle');
  
  // Chart data state
  const [chartData, setChartData] = useState<ChartData>(data);
  const [selectedPreset, setSelectedPreset] = useState<string>("basic");
  
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

  // Template mapping
  const templates: Record<string, React.ComponentType<any> | null> = {
    'none': null,
    'rectangle': RectangleTemplate,
    'circle': CircleTemplate,
    'triangle': TriangleTemplate,
    'diamond': DiamondTemplate,
  };
  
  // Handle dimension change
  const handleDimensionChange = (dimension: keyof ChartDimensions, value: number) => {
    setDimensions(prev => ({ ...prev, [dimension]: value }));
  };
  
  // Update the handleBarOptionChange function to use the correct type
  const handleBarOptionChange = (option: keyof BarOptions, value: any) => {
    // Update the appropriate state variable based on the option
    switch(option) {
      case 'barStrokePattern':
        setBarStrokePattern(value);
        break;
      case 'barStrokeWidth':
        setBarStrokeWidth(value);
        break;
      case 'barStrokeStyle':
        setBarStrokeStyle(value);
        break;
      case 'barDashArray':
        setBarDashArray(value);
        break;
      // Add other options as needed
      default:
        break;
    }
  };
  
  // Keep the original handleAxisOptionChange function
  const handleAxisOptionChange = (option: keyof AxisOptions, value: boolean | number | undefined) => {
    setAxisOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle domain change
  const handleDomainChange = (min: number | undefined, max: number | undefined) => {
    setAxisOptions(prev => ({ ...prev, yDomainMin: min, yDomainMax: max }));
  };
  
  // Function to generate random data
  const generateRandomData = () => {
    const newData = generateRandomBarData();
    setChartData(newData);
    setSelectedPreset("custom");
  };
  
  // Add function to handle preset selection
  const handlePresetChange = (preset: string) => {
    if (preset === "random") {
      generateRandomData();
    } else if (preset in sampleDataSets && preset !== 'grouped') {
      setChartData(sampleDataSets[preset as keyof typeof sampleDataSets]);
      setSelectedPreset(preset);
    } else if (['exponential', 'logarithmic', 'sinusoidal'].includes(preset)) {
      // Generate special trends for bar chart with category labels
      const trendData = generateTrendData(
        preset as 'exponential' | 'logarithmic' | 'sinusoidal',
        5, // Fewer data points for bar charts
        true // Use categories instead of months
      );
      setChartData(trendData);
      setSelectedPreset(preset);
    }
  };
  
  // Get chart config for saving
  const getChartConfig = (): BarChartConfig => {
    return {
      width: dimensions.width,
      height: dimensions.height,
      barPadding,
      barFill,
      barFillOpacity,
      barStrokePattern,
      barFillPattern,
      barFillZoomLevel,
      barStrokeWidth,
      barStrokeStyle,
      barDashArray,
      showXAxis: axisOptions.showXAxis,
      showYAxis: axisOptions.showYAxis,
      yDomainMin: axisOptions.yDomainMin,
      yDomainMax: axisOptions.yDomainMax,
      selectedTemplate
    };
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
  
  // Load chart when loadedChart prop changes
  useEffect(() => {
    if (loadedChart && loadedChart.type === 'bar') {
      const config = loadedChart.config as BarChartConfig;
      setDimensions({
        width: config.width,
        height: config.height
      });
      setBarPadding(config.barPadding);
      setBarFill(config.barFill ?? false);
      setBarFillOpacity(config.barFillOpacity ?? 0.5);
      setBarStrokePattern(config.barStrokePattern ?? 'solid');
      setBarFillPattern(config.barFillPattern ?? 'solid');
      setBarFillZoomLevel(config.barFillZoomLevel ?? 8);
      setBarStrokeWidth(config.barStrokeWidth ?? 1);
      setBarStrokeStyle(config.barStrokeStyle ?? 'normal');
      setBarDashArray(config.barDashArray ?? '6,4');
      setAxisOptions({
        showXAxis: config.showXAxis,
        showYAxis: config.showYAxis,
        yDomainMin: config.yDomainMin,
        yDomainMax: config.yDomainMax
      });
      setSelectedTemplate(config.selectedTemplate);
      
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
              barFill={barFill}
              barFillOpacity={barFillOpacity}
              barStrokePattern={barStrokePattern}
              barFillPattern={barFillPattern}
              barFillZoomLevel={barFillZoomLevel}
              barStrokeWidth={barStrokeWidth}
              barStrokeStyle={barStrokeStyle}
              barDashArray={barDashArray}
              showXAxis={axisOptions.showXAxis}
              showYAxis={axisOptions.showYAxis}
              yDomainMin={axisOptions.yDomainMin}
              yDomainMax={axisOptions.yDomainMax}
              template={templates[selectedTemplate]}
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
            </>
          }
          chartSpecificControls={
            <>
              <BarTemplateSection 
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
              
              <BarAppearanceSection 
                barPadding={barPadding}
                barFill={barFill}
                barFillOpacity={barFillOpacity}
                barFillPattern={barFillPattern}
                barFillZoomLevel={barFillZoomLevel}
                onBarPaddingChange={setBarPadding}
                onBarFillChange={setBarFill}
                onBarFillOpacityChange={setBarFillOpacity}
                onBarFillPatternChange={setBarFillPattern}
                onBarFillZoomLevelChange={setBarFillZoomLevel}
              />

              <div className="section">
                <h3>Export Variations</h3>
                <p>Generate and download multiple variations of this chart</p>
                <ExportVariationsButton
                  chartType="bar"
                  chartRef={chartRef}
                  setChartSettings={(settings: any) => {
                    if ('templateName' in settings) {
                      setSelectedTemplate(settings.templateName);
                    }
                    if ('data' in settings) {
                      setChartData(settings.data);
                    }
                  }}
                />
              </div>
            </>
          }
          showExportOptions={showExportOptions}
          exportOptions={
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
};

export default BarChartControls;