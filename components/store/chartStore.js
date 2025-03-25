import { create } from 'zustand';

// Create chart-specific store with no shared properties
export const useChartStore = create()((set, get) => ({
  // Export options
  showExportOptions: false,
  exportFileName: '',
  exportFileType: 'png',
  
  // Bar chart settings
  barPadding: 0.2,
  selectedTemplate: 'rectangle',
  
  // Line chart settings
  curveType: 'linear',
  curveTension: 0.5,
  showPoints: true,
  pointRadius: 4,
  pointShape: 'circle',
  
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