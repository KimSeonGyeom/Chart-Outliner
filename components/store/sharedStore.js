import { create } from 'zustand';

// Create a slice with the shared state functionality
export const createSharedSlice = (set) => ({
  // Default values
  chartType: 'bar',
  dimensions: {
    width: 512,
    height: 512
  },
  axisOptions: {
    showXAxis: true,
    showYAxis: true,
    yDomainMin: undefined,
    yDomainMax: undefined
  },
  chartData: [], // Will be initialized by specific stores
  selectedPreset: 'basic',
  
  // Actions
  setChartType: (type) => set({ chartType: type }),
  setDimensions: (dimensions) => set((state) => ({
    dimensions: { ...state.dimensions, ...dimensions }
  })),
  setAxisOptions: (options) => set((state) => ({
    axisOptions: { ...state.axisOptions, ...options }
  })),
  setChartData: (data) => set({ chartData: data }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset })
});

// Create a standalone shared store that can be used if needed
export const useSharedStore = create()((...args) => ({
  ...createSharedSlice(...args)
}));