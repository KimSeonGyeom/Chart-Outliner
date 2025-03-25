import { create } from 'zustand';

interface UIStore {
  // Save dialog state
  isSavingOpen: boolean;
  chartName: string;
  
  // Export dialog state
  isExportingOpen: boolean;
  showExportOptions: boolean;
  exportFileName: string;
  exportFileType: 'png' | 'jpg' | 'svg';
  exportAsOutlines: boolean;
  exportWireframeStyle: boolean;
  
  // Actions for save dialog
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
  setChartName: (name: string) => void;
  
  // Actions for export dialog
  openExportDialog: () => void;
  closeExportDialog: () => void;
  toggleExportOptions: () => void;
  setExportFileName: (name: string) => void;
  setExportFileType: (type: 'png' | 'jpg' | 'svg') => void;
  setExportAsOutlines: (value: boolean) => void;
  setExportWireframeStyle: (value: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Save dialog initial state
  isSavingOpen: false,
  chartName: '',
  
  // Export dialog initial state
  isExportingOpen: false,
  showExportOptions: false,
  exportFileName: '',
  exportFileType: 'png',
  exportAsOutlines: false,
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
})); 