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
  saveChart
} from '../controls';
import '../../styles/components/ControlPanel.scss';
import '../../styles/components/BarChartControls.scss';

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

interface BarChartControlsProps {
  data?: ChartData;
  title?: string;
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

const BarChartControls: React.FC<BarChartControlsProps> = ({
  data = sampleData,
  title = "Bar Chart Templates Demo",
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
}) => {
  // Chart dimensions
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 600,
    height: 400
  });
  
  // Bar appearance
  const [barPadding, setBarPadding] = useState(0.2);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('rectangle');
  
  // Axis appearance
  const [axisOptions, setAxisOptions] = useState<AxisOptions>({
    showXAxis: true,
    showYAxis: true,
    yDomainMin: undefined,
    yDomainMax: undefined
  });

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
        alert('Chart saved successfully!');
      },
      onSaveError: (error) => {
        console.error('Error saving chart:', error);
        alert('Failed to save chart. Please try again.');
        onSaveClose();
      }
    });
  };
  
  // Load a saved chart
  const loadSavedChart = (chart: SavedChartData) => {
    if (chart.type !== 'bar') return;
    if (onLoadChart) {
      onLoadChart(chart);
    }
    
    const config = chart.config as BarChartConfig;
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

  return (
    <div className="bar-chart-wrapper">
      <div className="bar-chart-controls">
        <div className="chart-container">
          <div ref={chartRef} className="chart-display">
            <BarChart
              data={data}
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
          sharedControls={sharedControls}
          chartSpecificControls={chartSpecificControls}
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