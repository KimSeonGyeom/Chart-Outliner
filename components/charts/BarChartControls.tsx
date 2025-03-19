"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  ChartDimensions,
  AxisOptions,
  ChartType,
  SaveDialog,
  saveChart,
  downloadChart
} from '../controls';
import { sampleDataSets, generateRandomBarData } from '../data';
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
    width: loadedConfig?.width || 600,
    height: loadedConfig?.height || 400
  });
  
  // Bar appearance
  const [barPadding, setBarPadding] = useState(loadedConfig?.barPadding || 0.2);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>(loadedConfig?.selectedTemplate || 'rectangle');
  
  // Data state
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
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>(chartName || 'chart');

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
  
  // Handle axis option change
  const handleAxisOptionChange = (option: keyof AxisOptions, value: boolean | number | undefined) => {
    setAxisOptions(prev => ({ ...prev, [option]: value }));
  };
  
  // Handle domain change
  const handleDomainChange = (min: number | undefined, max: number | undefined) => {
    setAxisOptions(prev => ({ ...prev, yDomainMin: min, yDomainMax: max }));
  };
  
  // Function to generate random data
  const generateRandomData = () => {
    setChartData(generateRandomBarData());
    setSelectedPreset("custom");
  };
  
  // Function to handle preset selection
  const handlePresetChange = (preset: string) => {
    if (preset === "random") {
      generateRandomData();
    } else if (preset in sampleDataSets) {
      setChartData(sampleDataSets[preset as keyof typeof sampleDataSets]);
      setSelectedPreset(preset);
    }
  };
  
  // Get chart config for saving
  const getChartConfig = (): BarChartConfig => {
    return {
      width: dimensions.width,
      height: dimensions.height,
      barPadding,
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
  
  // Add data controls section
  const dataControls = (
    <div className="section">
      <h3>Data Options</h3>
      <div className="control-group">
        <label>Preset Data</label>
        <div className="data-presets">
          <select 
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="basic">Basic Trend</option>
            <option value="rising">Rising Trend</option>
            <option value="falling">Falling Trend</option>
            <option value="grouped">Grouped Categories</option>
            <option value="exponential">Exponential Growth</option>
            <option value="logarithmic">Logarithmic Growth</option>
            <option value="sinusoidal">Sine Wave</option>
            <option value="custom" disabled={selectedPreset !== "custom"}>Custom</option>
          </select>
          <button 
            className="randomize-button"
            onClick={generateRandomData}
            title="Generate random data"
          >
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
  
  // Chart-specific controls
  const chartSpecificControls = (
    <>
      {dataControls}
      
      <BarTemplateSection
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
      />
      
      <BarAppearanceSection
        barPadding={barPadding}
        onBarPaddingChange={setBarPadding}
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
    <div className="bar-chart-wrapper">
      <div className="bar-chart-controls">
        <div className="chart-container">
          <div ref={chartRef} className="chart-display">
            <BarChart
              data={chartData}
              width={dimensions.width}
              height={dimensions.height}
              barPadding={barPadding}
              template={templates[selectedTemplate]}
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

export default BarChartControls;