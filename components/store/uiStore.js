import { create } from 'zustand';
import { StoreSlice } from './storeUtils.js';

// Define the UI store state


// Create the UI store slice
const createUISlice = (set) => ({
  // Save dialog initial state
  isSavingOpen: false,
  chartName: '',
  
  // Export dialog initial state
  isExportingOpen: false,
  showExportOptions: false,
  exportFileName: '',
  exportFileType: 'png',
  exportAsOutlines: true,
  exportWireframeStyle: false,
  
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
  setExportWireframeStyle: (value) => set({ exportWireframeStyle: value })
});

// Create the UI store
export const useUIStore = create()((...args) => ({
  ...createUISlice(...args)
})); 