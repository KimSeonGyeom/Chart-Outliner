import { create } from 'zustand';

/**
 * Constants for application settings
 */
export const AI_CONSTANTS = {
  NUM_METAPHORS: 4, // The fixed number of metaphor slots/placeholders to display
};

/**
 * Constants for metaphor property names
 * These ensure consistency between the API responses and component rendering
 */
export const METAPHOR_PROPS = {
  // Standard API properties
  OBJECT: "metaphorical object",
  DATA_TREND_REASON: "reason why this metaphor is fit for the visual interpretation(data trend)",
  SUBJECT_REASON: "reason why this metaphor is fit for the chart's subject(not data trend)",
  INTENT_REASON: "reason why this metaphor is fit for the author's intent",
  
  // Alternate properties that might be used in other parts of the app
  OBJECT_FOR_MARKS: "metaphorical object for the chart's marks",
};

/**
 * Store for managing AI-related state and operations
 * This centralizes all AI functionality that was previously managed with useState
 */
export const useAiStore = create()((set, get) => ({
  // States for AI prompt and results
  aiPrompt: '',                 // Stores the raw AI prompt or response
  parsedPrompts: null,          // Stores the parsed JSON response from AI
  selectedPrompt: null,         // Currently selected metaphor prompt index
  isGenerating: false,          // Whether the system is generating metaphors
  apiError: '',                 // Any error messages from API calls
  generatedImages: {},          // Object mapping indices to generated image URLs
  isGeneratingImage: false,     // Whether the system is generating an image
  currentlyGeneratingIndex: null, // Index of the metaphor being generated as image
  
  // Image data storage (base64)
  chartImageData: null,         // Base64 encoded chart image for API calls
  
  // Actions
  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
  setParsedPrompts: (prompts) => set({ parsedPrompts: prompts }),
  setSelectedPrompt: (index) => set({ selectedPrompt: index }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setApiError: (error) => set({ apiError: error }),
  
  // Store a generated image URL for a specific metaphor index
  setGeneratedImageUrl: (index, imageUrl) => set(state => ({
    generatedImages: {
      ...state.generatedImages,
      [index]: imageUrl
    }
  })),
  
  setIsGeneratingImage: (isGenerating) => set({ isGeneratingImage: isGenerating }),
  setCurrentlyGeneratingIndex: (index) => set({ currentlyGeneratingIndex: index }),
  
  // Store the base64 encoded chart image data
  setChartImageData: (imageData) => set({ chartImageData: imageData }),
  
  // Reset all AI state to initial values
  resetAiStates: () => set({
    aiPrompt: '',
    parsedPrompts: null,
    selectedPrompt: null,
    apiError: '',
    isGenerating: false,
    currentlyGeneratingIndex: null
  }),
  
  // Clear all generated images
  clearGeneratedImages: () => set({ generatedImages: {} }),
  
  // Helper to get the image URL for the currently selected metaphor
  getSelectedImage: () => {
    const state = get();
    if (state.selectedPrompt !== null && state.generatedImages[state.selectedPrompt]) {
      return state.generatedImages[state.selectedPrompt];
    }
    return null;
  },
})); 