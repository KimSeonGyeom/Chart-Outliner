import { create } from 'zustand';

// Create chart-specific store with no shared properties
export const useChartStore = create((set) => ({
  // Export options
  exportFileName: '',
  exportFileType: 'png',
  
  // Bar chart settings
  barPadding: 0.2,
  barShape: 'rectangle',
  
  // Line chart settings
  curveType: 'linear',
  curveTension: 0.5,
  showPoints: true,
  pointRadius: 5,
  pointShape: 'circle',
  
  // Actions
  setBarPadding: (padding) => set({ barPadding: padding }),
  setBarShape: (shape) => set({ barShape: shape }),
  
  setCurveType: (type) => set({ curveType: type }),
  setCurveTension: (tension) => set({ curveTension: tension }),
  setShowPoints: (show) => set({ showPoints: show }),
  setPointRadius: (radius) => set({ pointRadius: radius }),
  setPointShape: (shape) => set({ pointShape: shape }),
  
  // Chart-specific actions
  setExportOption: (key, value) => set((state) => ({
    [key]: value
  })),
  
  // Update any individual setting
  updateSetting: (key, value) => set((state) => ({
    [key]: value
  })),
  
  // Update multiple settings at once
  updateSettings: (settings) => set((state) => ({
    ...settings
  })),
})); 