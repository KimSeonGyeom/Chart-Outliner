import { create } from 'zustand';
import { sampleDataSets } from './dataStore.js';
import { SharedState, createSharedSlice } from './sharedStore.js';

// Create chart-specific slice
const createChartSpecificSlice = (set, get) => ({
  // Default bar chart settings
  barSettings: {
    barPadding: 0.2,
    barFill: false,
    barFillOpacity: 1,
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
    fillOpacity: 1,
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
  })),
  
  // Load line chart configuration
  loadLineChartConfig: (config) => set((state) => ({
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
  })),
  
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