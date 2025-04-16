import { create } from 'zustand';

// Create chart-specific store with no shared properties
export const useChartStore = create((set) => ({
  // Export options
  exportFileName: '',
  exportFileType: 'png',
  
  // Bar chart settings
  barPadding: 0.05,
  
  // Dimensions
  width: 512,
  height: 512,

  // Axis options
  showXAxis: true,
  showYAxis: true,
  yDomainMin: undefined,
  yDomainMax: undefined,


  // Actions
  setBarPadding: (padding) => set({ barPadding: padding }),
  
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