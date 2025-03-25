import { create } from 'zustand';
import { sampleDataSets } from './dataStore.js';
import { SharedState, createSharedSlice } from './sharedStore.js';

// Create chart-specific slice
const createChartSpecificSlice = (set, get) => ({
  // Shared chart settings
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
  
  // Export options
  exportOptions: {
    showExportOptions: false,
    exportFileName: '',
    exportFileType: 'png'
  },
  
  // Shared fill settings
  fillSettings: {
    fill: false,
    fillPattern: 'solid',
    fillZoomLevel: 8
  },
  
  // Default bar chart settings
  barSettings: {
    barPadding: 0.2,
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
    showPoints: true,
    pointRadius: 4,
    pointShape: 'circle',
    lineStrokePattern: 'solid',
    lineStrokeWidth: 2,
    lineStrokeStyle: 'normal',
    lineDashArray: '6,4'
  },
  
  // Shared actions
  setDimensions: (dimensions) => set((state) => ({
    dimensions: { ...state.dimensions, ...dimensions }
  })),
  
  setAxisOptions: (options) => set((state) => ({
    axisOptions: { ...state.axisOptions, ...options }
  })),
  
  setChartData: (data) => set({ chartData: data }),
  
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  
  setExportOptions: (options) => set((state) => ({
    exportOptions: { ...state.exportOptions, ...options }
  })),
  
  // Shared fill settings actions
  updateFillSettings: (settings) => set((state) => ({
    fillSettings: { ...state.fillSettings, ...settings }
  })),
  
  // Bar chart actions
  updateBarSettings: (settings) => set((state) => ({
    barSettings: { ...state.barSettings, ...settings }
  })),
  
  // Line chart actions
  updateLineSettings: (settings) => set((state) => ({
    lineSettings: { ...state.lineSettings, ...settings }
  })),
  
  // Load bar chart configuration
  loadBarChartConfig: (config) => set((state) => ({
    dimensions: {
      width: config.width || state.dimensions.width,
      height: config.height || state.dimensions.height
    },
    axisOptions: {
      showXAxis: config.showXAxis ?? true,
      showYAxis: config.showYAxis ?? true,
      yDomainMin: config.yDomainMin,
      yDomainMax: config.yDomainMax
    },
    fillSettings: {
      fill: config.barFill ?? false,
      fillPattern: config.barFillPattern ?? 'solid',
      fillZoomLevel: config.barFillZoomLevel ?? 8
    },
    barSettings: {
      barPadding: config.barPadding ?? 0.2,
      barStrokePattern: config.barStrokePattern ?? 'solid',
      barStrokeWidth: config.barStrokeWidth ?? 1,
      barStrokeStyle: config.barStrokeStyle ?? 'normal',
      barDashArray: config.barDashArray ?? '6,4',
      selectedTemplate: config.selectedTemplate ?? 'rectangle'
    }
  })),
  
  // Load line chart configuration
  loadLineChartConfig: (config) => set((state) => ({
    dimensions: {
      width: config.width || state.dimensions.width,
      height: config.height || state.dimensions.height
    },
    axisOptions: {
      showXAxis: config.showXAxis ?? true,
      showYAxis: config.showYAxis ?? true,
      yDomainMin: config.yDomainMin,
      yDomainMax: config.yDomainMax
    },
    fillSettings: {
      fill: config.fill ?? false,
      fillPattern: config.fillPattern ?? 'solid',
      fillZoomLevel: config.fillZoomLevel ?? 8
    },
    lineSettings: {
      marginTop: config.marginTop ?? 20,
      marginRight: config.marginRight ?? 20,
      marginBottom: config.marginBottom ?? 30,
      marginLeft: config.marginLeft ?? 40,
      curveType: config.curveType ?? 'linear',
      curveTension: config.curveTension ?? 0.5,
      showPoints: config.showPoints ?? true,
      pointRadius: config.pointRadius ?? 4,
      pointShape: config.pointShape ?? 'circle',
      lineStrokePattern: config.lineStrokePattern ?? 'solid',
      lineStrokeWidth: config.lineStrokeWidth ?? 2,
      lineStrokeStyle: config.lineStrokeStyle ?? 'normal',
      lineDashArray: config.lineDashArray ?? '6,4'
    }
  })),
  
  // Get current bar chart configuration
  getBarChartConfig: () => {
    const state = get();
    return {
      width: state.dimensions.width,
      height: state.dimensions.height,
      barPadding: state.barSettings.barPadding,
      barFill: state.fillSettings.fill,
      barFillPattern: state.fillSettings.fillPattern,
      barFillZoomLevel: state.fillSettings.fillZoomLevel,
      barStrokePattern: state.barSettings.barStrokePattern,
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
      fill: state.fillSettings.fill,
      fillPattern: state.fillSettings.fillPattern,
      fillZoomLevel: state.fillSettings.fillZoomLevel,
      showPoints: state.lineSettings.showPoints,
      pointRadius: state.lineSettings.pointRadius,
      pointShape: state.lineSettings.pointShape,
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
});

// Create the store with combined slices
export const useChartStore = create()((...args) => {
  // Initialize shared state with sample data
  const initialSharedState = createSharedSlice(...args);
  initialSharedState.chartData = sampleDataSets.basic;

  return {
    ...initialSharedState,
    ...createChartSpecificSlice(...args)
  };
}); 