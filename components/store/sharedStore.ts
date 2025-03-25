import { create } from 'zustand';
import { ChartData } from '../templates/types';
import { ChartType } from '../controls/types';
import { ChartDimensions, AxisOptions } from '../controls/types';
import { StoreSlice } from './storeUtils';

// Define the base shared state interface
export interface SharedState {
  // Common chart properties
  chartType: ChartType;
  dimensions: ChartDimensions;
  axisOptions: AxisOptions;
  chartData: ChartData;
  selectedPreset: string;
  
  // Actions
  setChartType: (type: ChartType) => void;
  setDimensions: (dimensions: Partial<ChartDimensions>) => void;
  setAxisOptions: (options: Partial<AxisOptions>) => void;
  setChartData: (data: ChartData) => void;
  setSelectedPreset: (preset: string) => void;
}

// Create a slice with the shared state functionality
export const createSharedSlice: StoreSlice<SharedState> = (set) => ({
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
export const useSharedStore = create<SharedState>()((...args) => ({
  ...createSharedSlice(...args)
}));