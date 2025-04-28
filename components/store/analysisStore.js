import { create } from 'zustand';

export const useAnalysisStore = create((set) => ({
  // State
  data: [],                 // Raw data from CSV
  analysisData: null,       // Processed analysis data
  loading: true,            // Loading state for raw data
  analysisLoading: true,    // Loading state for analysis data
  
  // Visualization controls
  activeTab: 'visualization',
  selectedVariable: 'data_trend',   // Default selected variable to analyze
  selectedMetric: 'CLIP',           // Default metric to display
  
  // Metrics configuration - each metric has its own chart preferences
  metrics: [
    { 
      id: 'CLIP', 
      label: 'CLIP Score',
      color: '#4f46e5',
    },
    { 
      id: 'Lie_Factor', 
      label: 'Lie Factor',
      color: '#ef4444',
    },
    { 
      id: 'Match_count', 
      label: 'Match Count',
      color: '#10b981',
    },
    { 
      id: 'Rank_Sim', 
      label: 'Rank Similarity',
      color: '#f59e0b',
    }
  ],
  
  // Helper function to get metric display name
  getMetricDisplay: (metricId) => {
    const metric = useAnalysisStore.getState().metrics.find(m => m.id === metricId);
    return metric ? metric.label : metricId;
  },
  
  // Helper to get metric color
  getMetricColor: (metricId) => {
    const metric = useAnalysisStore.getState().metrics.find(m => m.id === metricId);
    return metric ? metric.color : '#4f46e5';
  },
  
  // Actions
  setData: (data) => set({ data, loading: false }),
  setAnalysisData: (data) => set({ analysisData: data, analysisLoading: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),
  setSelectedMetric: (metric) => set({ selectedMetric: metric }),
  
  // Reset loading states (for refetching)
  setLoading: (value) => set({ loading: value }),
  setAnalysisLoading: (value) => set({ analysisLoading: value })
})); 