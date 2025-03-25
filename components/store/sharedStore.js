import { create } from 'zustand';

// Create the shared store with common properties
export const useSharedStore = create()((set) => ({
  // Default values
  chartType: 'bar',
  
  // Dimensions
  width: 512,
  height: 512,
  
  // Axis options
  showXAxis: true,
  showYAxis: true,
  yDomainMin: undefined,
  yDomainMax: undefined,
  
  // Fill settings
  fill: false,
  fillPattern: 'solid',
  fillZoomLevel: 8,
  fillOpacity: 1,
  
  // Template fill settings
  useTemplateFill: false,
  templateFillDensity: 5,
  templateFillOpacity: 1,
  templateFillSize: 10,
  selectedTemplate: 'rectangle',
  
  // Stroke settings
  strokePattern: 'solid',
  strokeWidth: 2,
  strokeColor: '#000',
  strokeStyle: 'normal',
  dashArray: '6,4',
  
  // Actions
  setChartType: (type) => set({ chartType: type }),
  
  // Update any individual setting
  updateSetting: (key, value) => set((state) => ({
    [key]: value
  })),
  
  // Update multiple settings at once
  updateSettings: (settings) => set((state) => ({
    ...settings
  })),
}));