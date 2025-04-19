import { create } from 'zustand';

// Create the UI store with direct state and actions
export const useUIStore = create()((set) => ({
  // Page navigation state
  currentPage: 'home', // Possible values: 'home', 'outputs', 'analysis'
  
  // Save dialog state
  isSavingOpen: false,
  chartName: '',
  
  // Export dialog state
  isExportingOpen: false,
  showExportOptions: false,
  exportFileName: '',
  exportFileType: 'png',
  exportAsOutlines: true,
  exportWireframeStyle: false,
  
  // Fill pattern preview state
  previewZoomLevel: 8,
  
  // Actions
  updateSetting: (key, value) => set((state) => ({
    [key]: value
  })),
  
  updateSettings: (settings) => set((state) => ({
    ...settings
  })),
  
  // Page navigation actions
  navigateTo: (page) => set({ currentPage: page }),
  
  // Save dialog actions
  openSaveDialog: () => set({ isSavingOpen: true }),
  closeSaveDialog: () => set({ isSavingOpen: false }),
  setChartName: (name) => set({ chartName: name }),
  
  // Export dialog actions
  openExportDialog: () => set({ isExportingOpen: true }),
  closeExportDialog: () => set({ isExportingOpen: false }),
  toggleExportOptions: () => set((state) => ({ showExportOptions: !state.showExportOptions })),
  setExportFileName: (name) => set({ exportFileName: name }),
  setExportFileType: (type) => set({ exportFileType: type }),
  setExportAsOutlines: (value) => set({ exportAsOutlines: value }),
  setExportWireframeStyle: (value) => set({ exportWireframeStyle: value }),
  
  // Fill pattern preview actions
  setPreviewZoomLevel: (value) => set({ previewZoomLevel: value })
})); 