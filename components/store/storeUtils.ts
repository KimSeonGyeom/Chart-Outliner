import { StateCreator } from 'zustand';

// Generic type for store slices with proper typing for zustand compatibility
export type StoreSlice<T extends object, E extends object = T> = (
  set: <K extends keyof T>(
    partial: ((state: T) => Pick<T, K> | Partial<T>) | Pick<T, K> | Partial<T>,
    replace?: boolean
  ) => void,
  get: () => T,
  api: any
) => E;

// Helper to create and combine slices for better store composition
export function createSelectors<T extends object>(store: any) {
  const storeState = store as {
    getState: () => T;
  } & { [K in keyof T as K extends string ? K : never]: () => T[K] };

  // For each key in the store state, create a selector
  Object.keys(store.getState()).forEach((key) => {
    const selector = (state: T) => state[key as keyof T];
    storeState[key as keyof typeof storeState] = () => selector(store.getState());
  });

  return storeState;
}

// Combine multiple store slices
export const combineSlices = <
  T extends object,
  Slices extends Record<string, StoreSlice<T>>
>(
  slices: Slices
): StateCreator<T> => {
  return (set, get, api) => {
    return Object.entries(slices).reduce(
      (acc, [_, slice]) => ({ ...acc, ...slice(set, get, api) }),
      {} as ReturnType<Slices[keyof Slices]>
    );
  };
};

// Create a middleware for logging store actions in development
export const loggerMiddleware = <T extends object>(
  config?: { name?: string; enabled?: boolean }
) => (
  set: <K extends keyof T>(
    partial: ((state: T) => Pick<T, K> | Partial<T>) | Pick<T, K> | Partial<T>,
    replace?: boolean
  ) => void,
  get: () => T,
  api: any
) => {
  const enabled = config?.enabled ?? process.env.NODE_ENV === 'development';
  const storeName = config?.name || 'Store';
  
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
export const createPersistMiddleware = <T extends object>(
  key: string,
  options?: {
    enabled?: boolean;
    include?: (keyof T)[];
    exclude?: (keyof T)[];
  }
) => {
  return (
    set: <K extends keyof T>(
      partial: ((state: T) => Pick<T, K> | Partial<T>) | Pick<T, K> | Partial<T>,
      replace?: boolean
    ) => void,
    get: () => T,
    api: any
  ) => {
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
        let persistedState: Partial<T> = { ...state };
        
        // Filter state based on include/exclude options
        if (options?.include) {
          persistedState = options.include.reduce((acc, key) => {
            acc[key] = state[key];
            return acc;
          }, {} as Partial<T>);
        } else if (options?.exclude) {
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