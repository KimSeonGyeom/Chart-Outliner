// Generic store slice function for zustand
export const createSelectors = (store) => {
  const storeState = store;

  // For each key in the store state, create a selector
  Object.keys(store.getState()).forEach((key) => {
    const selector = (state) => state[key];
    storeState[key] = () => selector(store.getState());
  });

  return storeState;
};

// Combine multiple store slices
export const combineSlices = (slices) => {
  return (set, get, api) => {
    return Object.entries(slices).reduce(
      (acc, [_, slice]) => ({ ...acc, ...slice(set, get, api) }),
      {}
    );
  };
};

// Create a middleware for logging store actions in development
export const loggerMiddleware = (config = {}) => (set, get, api) => {
  const enabled = config.enabled ?? process.env.NODE_ENV === 'development';
  const storeName = config.name || 'Store';
  
  return (partial, replace) => {
    if (enabled) {
      const prevState = get();
      
      // Log before update
      console.group(`%c${storeName}: Action`, 'color: #3498db');
      console.log('%cPrevious State:', 'color: #8e44ad', prevState);
      
      // Apply the state update
      set(partial, replace);
      
      // Log after update
      const nextState = get();
      console.log('%cNext State:', 'color: #2ecc71', nextState);
      console.groupEnd();
    } else {
      set(partial, replace);
    }
  };
};

// Helper to persist part of store state to localStorage
export const createPersistMiddleware = (key, options = {}) => {
  return (set, get, api) => {
    // Try to load persisted state on initialization
    try {
      const persistedState = localStorage.getItem(key);
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        set(parsed);
      }
    } catch (error) {
      console.error(`Error loading persisted state for ${key}:`, error);
    }
    
    return (partial, replace) => {
      // Apply the state update
      set(partial, replace);
      
      // Then persist the updated state
      try {
        const state = get();
        let persistedState = { ...state };
        
        // Filter state based on include/exclude options
        if (options.include) {
          persistedState = options.include.reduce((acc, key) => {
            acc[key] = state[key];
            return acc;
          }, {});
        } else if (options.exclude) {
          options.exclude.forEach((key) => {
            delete persistedState[key];
          });
        }
        
        localStorage.setItem(key, JSON.stringify(persistedState));
      } catch (error) {
        console.error(`Error persisting state for ${key}:`, error);
      }
    };
  };
}; 