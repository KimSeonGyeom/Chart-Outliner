import { create } from 'zustand';

// Create chart-specific store with no shared properties
export const useChartStore = create((set) => ({
  // Export options
  exportFileName: '',
  exportFileType: 'png',
  
  // Bar chart settings
  barPadding: 0.2,
  
  // Line chart settings
  showPoints: true,
  pointRadius: 5,
  pointShape: 'circle',
  
  // Actions
  setBarPadding: (padding) => set({ barPadding: padding }),
  
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