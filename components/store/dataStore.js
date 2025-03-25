import { create } from 'zustand';
import { SharedState, createSharedSlice } from './sharedStore.js';
import { StoreSlice } from './storeUtils.js';

// Data labels for random generation
export const dataLabels = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  categories: ['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat E', 'Cat F', 'Cat G', 'Cat H'],
};

// Generate a new dataset with a specific trend
export const generateTrendData = (
  trend, 
  numPoints = 7,
  useCategories = false
) => {
  const data = [];
  const labels = useCategories ? dataLabels.categories : dataLabels.months;
  
  switch (trend) {
    case 'linear':
      for (let i = 0; i < numPoints; i++) {
        data.push({
          x: labels[i % labels.length],
          y: Math.floor(10 + (i * 90) / (numPoints - 1))
        });
      }
      break;
      
    case 'exponential':
      for (let i = 0; i < numPoints; i++) {
        // Exponential growth formula= a * e^(b*x)
        // Using a = 10, b = 0.4
        const x = i / (numPoints - 1);
        data.push({
          x: labels[i % labels.length],
          y: Math.floor(10 * Math.exp(3 * x))
        });
      }
      break;
      
    case 'logarithmic':
      for (let i = 0; i < numPoints; i++) {
        // Logarithmic growth= a * ln(b*x + 1)
        // Using a = 30, b = 10
        const x = (i + 1) / numPoints;
        data.push({
          x: labels[i % labels.length],
          y: Math.floor(30 * Math.log(10 * x + 1))
        });
      }
      break;
      
    case 'sinusoidal':
      for (let i = 0; i < numPoints; i++) {
        // Sine wave= a * sin(b*x) + c
        // Using a = 40, b = 2*π, c = 50
        const x = i / (numPoints - 1);
        data.push({
          x: labels[i % labels.length],
          y: Math.floor(40 * Math.sin(2 * Math.PI * x) + 50)
        });
      }
      break;
  }
  
  return data;
};

// Sample datasets for charts
export const sampleDataSets = {
  basic: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 50 },
    { x: 'Mar', y: 20 },
    { x: 'Apr', y: 40 },
    { x: 'May', y: 70 },
    { x: 'Jun', y: 60 },
    { x: 'Jul', y: 80 },
  ],
  rising: [
    { x: 'Jan', y: 10 },
    { x: 'Feb', y: 20 },
    { x: 'Mar', y: 35 },
    { x: 'Apr', y: 45 },
    { x: 'May', y: 60 },
    { x: 'Jun', y: 80 },
    { x: 'Jul', y: 95 },
  ],
  falling: [
    { x: 'Jan', y: 90 },
    { x: 'Feb', y: 80 },
    { x: 'Mar', y: 65 },
    { x: 'Apr', y: 50 },
    { x: 'May', y: 35 },
    { x: 'Jun', y: 20 },
    { x: 'Jul', y: 10 },
  ],
  wave: [
    { x: 'Jan', y: 50 },
    { x: 'Feb', y: 80 },
    { x: 'Mar', y: 30 },
    { x: 'Apr', y: 90 },
    { x: 'May', y: 20 },
    { x: 'Jun', y: 70 },
    { x: 'Jul', y: 40 },
  ],
  grouped: [
    { x: 'Cat A', y: 25 },
    { x: 'Cat B', y: 65 },
    { x: 'Cat C', y: 40 },
    { x: 'Cat D', y: 85 },
    { x: 'Cat E', y: 50 },
  ],
  // Add trend datasets
  exponential: generateTrendData('exponential'),
  logarithmic: generateTrendData('logarithmic'),
  sinusoidal: generateTrendData('sinusoidal'),
};

// Generate random data for line charts
export const generateRandomLineData = () => {
  const dataPoints = 7 + Math.floor(Math.random() * 6); // Between 7-12 data points
  const newData = [];
  
  for (let i = 0; i < dataPoints; i++) {
    newData.push({
      x: dataLabels.months[i % 12],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Generate random data for bar charts
export const generateRandomBarData = () => {
  const dataPoints = 5 + Math.floor(Math.random() * 4); // Between 5-8 data points
  const newData = [];
  
  for (let i = 0; i < dataPoints; i++) {
    newData.push({
      x: dataLabels.categories[i % dataLabels.categories.length],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Create data specific slice
const createDataSpecificSlice = (set) => ({
  // Generate random data based on chart type
  randomizeData: (chartType) => {
    if (chartType === 'bar') {
      const newData = generateRandomBarData();
      set({ chartData: newData, selectedPreset: 'custom' });
    } else {
      const newData = generateRandomLineData();
      set({ chartData: newData, selectedPreset: 'custom' });
    }
  },
  
  // Load preset data
  loadPresetData: (preset, chartType) => {
    if (preset === 'random') {
      if (chartType === 'bar') {
        const newData = generateRandomBarData();
        set({ chartData: newData, selectedPreset: 'custom' });
      } else {
        const newData = generateRandomLineData();
        set({ chartData: newData, selectedPreset: 'custom' });
      }
      return;
    }
    
    if (preset in sampleDataSets) {
      set({ 
        chartData: sampleDataSets[preset],
        selectedPreset: preset 
      });
      return;
    }
    
    // Handle trend data
    if (['exponential', 'logarithmic', 'sinusoidal'].includes(preset)) {
      const useCategories = chartType === 'bar';
      const dataPoints = useCategories ? 5 : 7; // Fewer data points for bar charts
      
      const trendData = generateTrendData(
        preset,
        dataPoints,
        useCategories
      );
      
      set({ chartData: trendData, selectedPreset: preset });
    }
  }
});

// Create the data store
export const useDataStore = create()((...args) => {
  // Initialize shared state with sample data
  const initialSharedState = createSharedSlice(...args);
  initialSharedState.chartData = sampleDataSets.basic;

  return {
    ...initialSharedState,
    ...createDataSpecificSlice(...args)
  };
}); 