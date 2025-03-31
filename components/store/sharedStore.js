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
  strokeWidth: 1,
  strokeColor: '#000',
  strokeStyle: 'normal',
  dashArray: '6,4',
  
  // Transformation settings
  transformationType: 'none',
  translationX: 0,
  translationY: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0,
  perspective: 800,
  distortionType: 'turbulence',
  distortionAmount: 10,
  distortionCenterX: 0.5,
  distortionCenterY: 0.5,
  
  // Actions
  setChartType: (type) => set({ chartType: type }),
  
  // Transformation actions
  setTransformationType: (type) => set({ transformationType: type }),
  setTranslationX: (value) => set({ translationX: value }),
  setTranslationY: (value) => set({ translationY: value }),
  setScaleX: (value) => set({ scaleX: value }),
  setScaleY: (value) => set({ scaleY: value }),
  setRotation: (value) => set({ rotation: value }),
  setSkewX: (value) => set({ skewX: value }),
  setSkewY: (value) => set({ skewY: value }),
  setPerspective: (value) => set({ perspective: value }),
  setDistortionType: (type) => set({ distortionType: type }),
  setDistortionAmount: (value) => set({ distortionAmount: value }),
  setDistortionCenterX: (value) => set({ distortionCenterX: value }),
  setDistortionCenterY: (value) => set({ distortionCenterY: value }),
  
  // Update any individual setting
  updateSetting: (key, value) => set((state) => ({
    [key]: value
  })),
  
  // Update multiple settings at once
  updateSettings: (settings) => set((state) => ({
    ...settings
  })),
}));