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
      preferredChartTypes: ['bar', 'radar', 'line']
    },
    { 
      id: 'Lie_Factor', 
      label: 'Lie Factor',
      color: '#ef4444',
      preferredChartTypes: ['distribution', 'heatmap', 'bar']
    },
    { 
      id: 'Match_count', 
      label: 'Match Count',
      color: '#10b981',
      preferredChartTypes: ['bar', 'correlation', 'distribution']
    },
    { 
      id: 'Rank_Sim', 
      label: 'Rank Similarity',
      color: '#f59e0b',
      preferredChartTypes: ['correlation', 'radar', 'heatmap']
    }
  ],
  
  // Variables configuration - each variable defines which charts are appropriate
  variables: [
    { id: 'data_trend', label: 'Data Trend', 
      chartTypes: ['bar', 'distribution', 'correlation'] },
    { id: 'data_count', label: 'Data Count', 
      chartTypes: ['bar', 'distribution', 'correlation'] },
    { id: 'canny', label: 'Canny Technique', 
      chartTypes: ['radar', 'distribution', 'heatmap'] },
    { id: 'asset', label: 'Asset Type', 
      chartTypes: ['bar', 'radar', 'correlation'] },
    { id: 'asset_size', label: 'Width Scale', 
      chartTypes: ['line', 'bar', 'heatmap'] }
  ],
  
  // Helper function to get variable display name
  getVariableDisplay: (variableId) => {
    const variable = useAnalysisStore.getState().variables.find(v => v.id === variableId);
    return variable ? variable.label : variableId;
  },
  
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
  
  // Helper to get appropriate chart types for the selected variable
  getChartTypes: () => {
    const state = useAnalysisStore.getState();
    const variable = state.variables.find(v => v.id === state.selectedVariable);
    return variable ? variable.chartTypes : ['bar', 'distribution', 'correlation', 'heatmap'];
  },
  
  // Helper to get all available chart types
  getAllChartTypes: () => {
    return ['bar', 'distribution', 'correlation', 'heatmap', 'radar', 'line'];
  },
  
  // Helper to get chart description
  getChartDescription: (chartType) => {
    const descriptions = {
      'bar': 'Compare average values across categories',
      'distribution': 'View the spread of values within each category',
      'correlation': 'Analyze relationships between variables',
      'heatmap': 'Visualize statistical significance patterns',
      'radar': 'Compare multiple metrics across categories',
      'line': 'Track trends and changes across ordered values'
    };
    return descriptions[chartType] || 'Chart visualization';
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