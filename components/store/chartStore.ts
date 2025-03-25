import { create } from 'zustand';
import { ChartType } from '../controls/types';
import { ChartDimensions, AxisOptions } from '../controls/types';
import { BarChartConfig, LineChartConfig } from '../gallery/types';
import { sampleDataSets } from './dataStore';
import { ChartData } from '../templates/types';

// Define interfaces for each chart type's settings
interface BarChartSettings {
  barPadding: number;
  barFill: boolean;
  barFillOpacity: number;
  barFillPattern: string;
  barFillZoomLevel: number;
  barStrokePattern: string;
  barStrokeWidth: number;
  barStrokeStyle: string;
  barDashArray: string;
  selectedTemplate: string;
}

interface LineChartSettings {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  curveType: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension: number;
  fill: boolean;
  fillOpacity: number;
  fillPattern: string;
  fillZoomLevel: number;
  showPoints: boolean;
  pointRadius: number;
  pointShape: string;
  pointStrokeWidth: number;
  lineStrokePattern: string;
  lineStrokeWidth: number;
  lineStrokeStyle: string;
  lineDashArray: string;
}

// Define the chart store state interface
interface ChartStore {
  // Common chart properties
  chartType: ChartType;
  dimensions: ChartDimensions;
  axisOptions: AxisOptions;
  chartData: ChartData;
  selectedPreset: string;
  
  // Chart-specific settings
  barSettings: BarChartSettings;
  lineSettings: LineChartSettings;
  
  // Action to change chart type
  setChartType: (type: ChartType) => void;
  
  // Actions to update dimensions and axis options
  setDimensions: (dimensions: Partial<ChartDimensions>) => void;
  setAxisOptions: (options: Partial<AxisOptions>) => void;
  
  // Actions for bar chart settings
  updateBarSettings: (settings: Partial<BarChartSettings>) => void;
  
  // Actions for line chart settings
  updateLineSettings: (settings: Partial<LineChartSettings>) => void;
  
  // Data-related actions
  setChartData: (data: ChartData) => void;
  setSelectedPreset: (preset: string) => void;
  
  // Load chart configuration
  loadBarChartConfig: (config: BarChartConfig) => void;
  loadLineChartConfig: (config: LineChartConfig) => void;
  
  // Get current configuration
  getBarChartConfig: () => BarChartConfig;
  getLineChartConfig: () => LineChartConfig;
}

// Create the store with default values
export const useChartStore = create<ChartStore>((set, get) => ({
  // Default common chart properties
  chartType: 'bar',
  dimensions: {
    width: 512,
    height: 512
  },
  axisOptions: {
    showXAxis: true,
    showYAxis: true,
    yDomainMin: undefined,
    yDomainMax: undefined
  },
  chartData: sampleDataSets.basic,
  selectedPreset: 'basic',
  
  // Default bar chart settings
  barSettings: {
    barPadding: 0.2,
    barFill: false,
    barFillOpacity: 1, // Changed to 1 as per requirement
    barFillPattern: 'solid',
    barFillZoomLevel: 8,
    barStrokePattern: 'solid',
    barStrokeWidth: 1,
    barStrokeStyle: 'normal',
    barDashArray: '6,4',
    selectedTemplate: 'rectangle'
  },
  
  // Default line chart settings
  lineSettings: {
    marginTop: 20,
    marginRight: 20,
    marginBottom: 30,
    marginLeft: 40,
    curveType: 'linear',
    curveTension: 0.5,
    fill: false,
    fillOpacity: 1, // Changed to 1 as per requirement
    fillPattern: 'solid',
    fillZoomLevel: 8,
    showPoints: true,
    pointRadius: 4,
    pointShape: 'circle',
    pointStrokeWidth: 1,
    lineStrokePattern: 'solid',
    lineStrokeWidth: 2,
    lineStrokeStyle: 'normal',
    lineDashArray: '6,4'
  },
  
  // Chart type action
  setChartType: (type) => set({ chartType: type }),
  
  // Dimensions and axis actions
  setDimensions: (dimensions) => set((state) => ({
    dimensions: { ...state.dimensions, ...dimensions }
  })),
  
  setAxisOptions: (options) => set((state) => ({
    axisOptions: { ...state.axisOptions, ...options }
  })),
  
  // Bar chart actions
  updateBarSettings: (settings) => set((state) => ({
    barSettings: { ...state.barSettings, ...settings }
  })),
  
  // Line chart actions
  updateLineSettings: (settings) => set((state) => ({
    lineSettings: { ...state.lineSettings, ...settings }
  })),
  
  // Data-related actions
  setChartData: (data) => set({ chartData: data }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  
  // Load bar chart configuration
  loadBarChartConfig: (config) => set({
    chartType: 'bar',
    dimensions: {
      width: config.width,
      height: config.height
    },
    axisOptions: {
      showXAxis: config.showXAxis ?? true,
      showYAxis: config.showYAxis ?? true,
      yDomainMin: config.yDomainMin,
      yDomainMax: config.yDomainMax
    },
    barSettings: {
      barPadding: config.barPadding ?? 0.2,
      barFill: config.barFill ?? false,
      barFillOpacity: 1, // Always set to 1
      barFillPattern: config.barFillPattern ?? 'solid',
      barFillZoomLevel: config.barFillZoomLevel ?? 8,
      barStrokePattern: config.barStrokePattern ?? 'solid',
      barStrokeWidth: config.barStrokeWidth ?? 1,
      barStrokeStyle: config.barStrokeStyle ?? 'normal',
      barDashArray: config.barDashArray ?? '6,4',
      selectedTemplate: config.selectedTemplate ?? 'rectangle'
    }
  }),
  
  // Load line chart configuration
  loadLineChartConfig: (config) => set({
    chartType: 'line',
    dimensions: {
      width: config.width,
      height: config.height
    },
    axisOptions: {
      showXAxis: config.showXAxis ?? true,
      showYAxis: config.showYAxis ?? true,
      yDomainMin: config.yDomainMin,
      yDomainMax: config.yDomainMax
    },
    lineSettings: {
      marginTop: config.marginTop ?? 20,
      marginRight: config.marginRight ?? 20,
      marginBottom: config.marginBottom ?? 30,
      marginLeft: config.marginLeft ?? 40,
      curveType: config.curveType ?? 'linear',
      curveTension: config.curveTension ?? 0.5,
      fill: config.fill ?? false,
      fillOpacity: 1, // Always set to 1
      fillPattern: config.fillPattern ?? 'solid',
      fillZoomLevel: config.fillZoomLevel ?? 8,
      showPoints: config.showPoints ?? true,
      pointRadius: config.pointRadius ?? 4,
      pointShape: config.pointShape ?? 'circle',
      pointStrokeWidth: config.pointStrokeWidth ?? 1,
      lineStrokePattern: config.lineStrokePattern ?? 'solid',
      lineStrokeWidth: config.lineStrokeWidth ?? 2,
      lineStrokeStyle: config.lineStrokeStyle ?? 'normal',
      lineDashArray: config.lineDashArray ?? '6,4'
    }
  }),
  
  // Get current bar chart configuration
  getBarChartConfig: () => {
    const state = get();
    return {
      width: state.dimensions.width,
      height: state.dimensions.height,
      barPadding: state.barSettings.barPadding,
      barFill: state.barSettings.barFill,
      barFillOpacity: state.barSettings.barFillOpacity,
      barStrokePattern: state.barSettings.barStrokePattern,
      barFillPattern: state.barSettings.barFillPattern,
      barFillZoomLevel: state.barSettings.barFillZoomLevel,
      barStrokeWidth: state.barSettings.barStrokeWidth,
      barStrokeStyle: state.barSettings.barStrokeStyle,
      barDashArray: state.barSettings.barDashArray,
      selectedTemplate: state.barSettings.selectedTemplate,
      showXAxis: state.axisOptions.showXAxis,
      showYAxis: state.axisOptions.showYAxis,
      yDomainMin: state.axisOptions.yDomainMin,
      yDomainMax: state.axisOptions.yDomainMax
    };
  },
  
  // Get current line chart configuration
  getLineChartConfig: () => {
    const state = get();
    return {
      width: state.dimensions.width,
      height: state.dimensions.height,
      marginTop: state.lineSettings.marginTop,
      marginRight: state.lineSettings.marginRight,
      marginBottom: state.lineSettings.marginBottom,
      marginLeft: state.lineSettings.marginLeft,
      curveType: state.lineSettings.curveType,
      curveTension: state.lineSettings.curveTension,
      fill: state.lineSettings.fill,
      fillOpacity: state.lineSettings.fillOpacity,
      fillPattern: state.lineSettings.fillPattern,
      fillZoomLevel: state.lineSettings.fillZoomLevel,
      showPoints: state.lineSettings.showPoints,
      pointRadius: state.lineSettings.pointRadius,
      pointShape: state.lineSettings.pointShape,
      pointStrokeWidth: state.lineSettings.pointStrokeWidth,
      lineStrokePattern: state.lineSettings.lineStrokePattern,
      lineStrokeWidth: state.lineSettings.lineStrokeWidth,
      lineStrokeStyle: state.lineSettings.lineStrokeStyle,
      lineDashArray: state.lineSettings.lineDashArray,
      showXAxis: state.axisOptions.showXAxis,
      showYAxis: state.axisOptions.showYAxis,
      yDomainMin: state.axisOptions.yDomainMin,
      yDomainMax: state.axisOptions.yDomainMax
    };
  }
})); 