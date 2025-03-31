import { create } from 'zustand';

// Define cost estimates for different API calls (in USD)
// These are rough estimates and can be adjusted as needed
const apiCosts = {
  interpretation: 0.01, // Cost per call for generate-interpretation API
  metaphors: 0.03,      // Cost per call for generate-metaphors API
  image: 0.02,          // Cost per call for generate-image API
};

// Create a store to track API costs
export const useCostStore = create()((set) => ({
  // Total cost tracking
  totalCost: 0,
  callCounts: {
    interpretation: 0,
    metaphors: 0,
    image: 0,
  },
  
  // Actions
  addApiCall: (type) => set((state) => {
    // Only add cost if type exists in apiCosts
    if (!apiCosts[type]) return state;
    
    const newCallCounts = {
      ...state.callCounts,
      [type]: state.callCounts[type] + 1,
    };
    
    const newTotalCost = state.totalCost + apiCosts[type];
    
    return {
      callCounts: newCallCounts,
      totalCost: newTotalCost,
    };
  }),
  
  // Reset all costs (for testing purposes)
  resetCosts: () => set({
    totalCost: 0,
    callCounts: {
      interpretation: 0,
      metaphors: 0,
      image: 0,
    },
  }),
})); 