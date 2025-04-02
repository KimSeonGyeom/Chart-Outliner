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
  
  // Actions
  setMetaphors: (metaphors) => set({ metaphors }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  // Store the base64 encoded chart image data
  setChartImageData: (imageData) => set({ chartImageData: imageData }),
  
  // Reset all AI state to initial values
  resetAiStates: () => set({
    metaphors: [],
    isGenerating: false,
  }),
})); 