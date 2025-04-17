import { create } from 'zustand';

export const AI_CONSTANTS = {
  NUM_METAPHORS: 4, // The fixed number of metaphor slots/placeholders to display
};

/**
 * Store for managing AI-related state and operations
 * This centralizes all AI functionality that was previously managed with useState
 */
export const useAiStore = create()((set, get) => ({
  // States for AI prompt and results
  metaphors: [],
  isGenerating: false,          // Whether the system is generating metaphors
  selectedTemplate: null,       // Selected template for rendering
  isLoading: false,             // Loading state for async operations
  chartImageData: null,         // Base64 encoded chart image data
  edgeImageData: null,          // Base64 encoded Canny edge detection image
  selectedEdgeImageData: null,  // Selected edge image data to use for bar chart pattern
  top_edge_image: null,         // Base64 encoded top 30% of edge image
  bottom_edge_image: null,      // Base64 encoded bottom 30% of edge image
  edgeImageData_Processed: {    // Base64 encoded Canny edge detection image, processed with additional vision processing
    default: null,
    sparsification: null,
    blur: null,
  }, 
  
  // Default processing parameters
  processingParams: {
    sparsification: { drop_rate: 0.7 },
    blur: { kernel_size: 10, sigma: 2.0 },
    contour: { epsilon_factor: 0.03 }
  },

  // Actions
  setMetaphors: (metaphors) => set({ metaphors }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Store the base64 encoded chart image data
  setChartImageData: (imageData) => set({ chartImageData: imageData }),
  
  // Store the base64 encoded edge detection image data
  setEdgeImageData: (imageData) => set({ edgeImageData: imageData }),
  
  // Store the selected edge image data for the bar chart pattern
  setSelectedEdgeImageData: (imageData) => set({ selectedEdgeImageData: imageData }),
  
  // Store top and bottom edge images
  setTopEdgeImage: (imageData) => set({ top_edge_image: imageData }),
  setBottomEdgeImage: (imageData) => set({ bottom_edge_image: imageData }),
  
  // Store processed edge images
  setProcessedEdgeImage: (type, imageData) => set(state => ({
    edgeImageData_Processed: {
      ...state.edgeImageData_Processed,
      [type]: imageData
    }
  })),
  
  // Set all processed edge images at once
  setAllProcessedEdgeImages: (processedImages) => set({
    edgeImageData_Processed: {
      ...processedImages
    }
  }),
  
  // Update processing parameters
  setProcessingParam: (technique, param, value) => set(state => ({
    processingParams: {
      ...state.processingParams,
      [technique]: {
        ...state.processingParams[technique],
        [param]: value
      }
    }
  })),
  
  // Reset all AI state to initial values
  resetAiStates: () => set({
    metaphors: [],
    isGenerating: false,
    selectedTemplate: null,
    isLoading: false,
    chartImageData: null,
    edgeImageData: null,
    selectedEdgeImageData: null,
    top_edge_image: null,
    bottom_edge_image: null,
    edgeImageData_Processed: {
      default: null,
      sparsification: null,
      blur: null,
    },
    processingParams: {
      sparsification: { drop_rate: 0.7 },
      blur: { kernel_size: 10, sigma: 2.0 },
    }
  }),
})); 