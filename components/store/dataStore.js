import { create } from 'zustand';

// Data dataLabels for random generation
export const dataLabels = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

// Generate a new dataset with a specific trend
export const generateTrendData = (
  trend, 
  numPoints = 7,
) => {
  const data = [];
  
  switch (trend) {
    case 'linear':
      for (let i = 0; i < numPoints; i++) {
        data.push({
          x: dataLabels[i % dataLabels.length],
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
          x: dataLabels[i % dataLabels.length],
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
          x: dataLabels[i % dataLabels.length],
          y: Math.floor(30 * Math.log(10 * x + 1))
        });
      }
      break;
  }
  
  return {
    data: data,
  };
};


// Sample datasets for charts
export const sampleDataSets = {
  basic: {
    data: [
    { x: '2020', y: 30 },
    { x: '2021', y: 50 },
    { x: '2022', y: 20 },
    { x: '2023', y: 40 },
    { x: '2024', y: 70 },
    { x: '2025', y: 60 },
    { x: '2026', y: 80 },
  ]},
  rising: {
    data: [
    { x: '2020', y: 10 },
    { x: '2021', y: 20 },
    { x: '2022', y: 35 },
    { x: '2023', y: 45 },
    { x: '2024', y: 60 },
    { x: '2025', y: 80 },
    { x: '2026', y: 95 },
    ]
  },
  falling: {
    data: [
    { x: '2020', y: 90 },
    { x: '2021', y: 80 },
    { x: '2022', y: 65 },
    { x: '2023', y: 50 },
    { x: '2024', y: 35 },
    { x: '2025', y: 20 },
    { x: '2026', y: 10 },
    ]
  },
  wave: {
    data: [
    { x: '2020', y: 50 },
    { x: '2021', y: 80 },
    { x: '2022', y: 30 },
    { x: '2023', y: 90 },
    { x: '2024', y: 20 },
    { x: '2025', y: 70 },
    { x: '2026', y: 40 },
    ]
  },
  // Add trend datasets
  exponential: generateTrendData('exponential'),
  logarithmic: generateTrendData('logarithmic'),
};

// Generate random data for any chart type
export const generateRandomData = (numPoints) => {
  const newData = [];
  
  for (let i = 0; i < numPoints; i++) {
    newData.push({
      x: dataLabels[i % dataLabels.length],
      y: Math.floor(Math.random() * 60) + 40 // Random value between 40-100
    });
  }
  
  return {
    data: newData,
  };
};

// Adjust data set to match the desired number of points
export const adjustDataSetSize = (dataset, numPoints) => {
  if (dataset.data.length === numPoints) {
    return dataset; // No adjustment needed
  }
  
  // Create a copy of the dataset and take the last numPoints
  return {
    data: dataset.data.length > numPoints 
      ? dataset.data.slice(dataset.data.length - numPoints) 
      : dataset.data.slice(0, numPoints)
  };
};

// Add this new function after adjustDataSetSize
// This function adjusts the size of a randomized dataset while preserving values
export const adjustRandomDataSetSize = (currentData, numPoints) => {
  // No change needed
  if (currentData.data.length === numPoints) {
    return currentData;
  }
  
  // Make a copy to avoid mutating the original
  const newData = {
    data: [...currentData.data]   // Copy the data array
  };
  
  // If we need to add more points
  if (newData.data.length < numPoints) {
    // How many points to add
    const pointsToAdd = numPoints - newData.data.length;
    
    for (let i = 0; i < pointsToAdd; i++) {
      // Add new points with random values but using the next labels
      const nextIndex = (newData.data.length) % dataLabels.length;
      newData.data.push({
        x: dataLabels[nextIndex],
        y: Math.floor(Math.random() * 60) + 40 // Same random range as generateRandomData
      });
    }
  } 
  // If we need to remove points
  else if (newData.data.length > numPoints) {
    // Just keep the first numPoints
    newData.data = newData.data.slice(0, numPoints);
  }
  
  return newData;
};

// Create the data store with only data-related properties
export const useDataStore = create()((set, get) => ({
  // Data properties
  chartData: adjustDataSetSize(sampleDataSets.basic, 5), // Apply the default 5 data points immediately
  selectedPreset: 'basic',
  numDataPoints: 5, // Default number of data points
  
  // Data actions
  setChartData: (data) => set({ chartData: data }),
  setSelectedPreset: (preset) => {
    const { numDataPoints } = get();
    // Ensure we're within our min/max bounds
    const pointsToGenerate = Math.max(3, Math.min(8, numDataPoints));
    
    // For trend data presets that support variable length
    if (['exponential', 'logarithmic'].includes(preset)) {
      const trendData = generateTrendData(
        preset,
        pointsToGenerate,
      );
      
      set({ 
        chartData: trendData,
        selectedPreset: preset 
      });
      return;
    }
    
    // For fixed presets, adjust their size to match numDataPoints
    if (preset in sampleDataSets) {
      const originalData = sampleDataSets[preset];
      console.log(`Loading ${preset} preset: adjusting from ${originalData.data.length} to ${pointsToGenerate} points`);
      const adjustedData = adjustDataSetSize(originalData, pointsToGenerate);
      
      set({ 
        chartData: adjustedData,
        selectedPreset: preset 
      });
      return;
    }
    
    // Fallback
    set({ selectedPreset: preset });
  },
  setNumDataPoints: (num) => {
    set({ numDataPoints: num });
    
    // Get current state after update
    const state = get();
    
    // Ensure we're within our min/max bounds
    const pointsToGenerate = Math.max(3, Math.min(8, num));
    
    // For custom/randomized datasets, adjust them intelligently
    if (state.selectedPreset === 'custom') {
      console.log(`Adjusting randomized data from ${state.chartData.data.length} to ${pointsToGenerate} points`);
      
      const adjustedData = adjustRandomDataSetSize(state.chartData, pointsToGenerate);
      set({ chartData: adjustedData });
    } 
    // For presets, update directly using the same logic as in loadPresetData
    else if (state.selectedPreset in sampleDataSets) {
      const originalData = sampleDataSets[state.selectedPreset];
      console.log(`Adjusting preset ${state.selectedPreset} from ${originalData.data.length} to ${pointsToGenerate} points`);
      const adjustedData = adjustDataSetSize(originalData, pointsToGenerate);
      
      set({ chartData: adjustedData });
    }
    // For trend data presets
    else if (['exponential', 'logarithmic'].includes(state.selectedPreset)) {
      const trendData = generateTrendData(
        state.selectedPreset,
        pointsToGenerate
      );
      
      set({ chartData: trendData });
    }
  },
  
  // Generate random data (works for any chart type)
  randomizeData: () => {
    const { numDataPoints } = get();
    // Ensure we're within our min/max bounds
    const pointsToGenerate = Math.max(3, Math.min(8, numDataPoints));
    
    console.log(`Generating ${pointsToGenerate} random data points`);
    
    const newData = generateRandomData(pointsToGenerate);
    set({ chartData: newData, selectedPreset: 'custom' });
  },
  
  // Load preset data
  loadPresetData: (preset) => {
    const { numDataPoints } = get();
    // Ensure we're within our min/max bounds
    const pointsToGenerate = Math.max(3, Math.min(8, numDataPoints));
    
    if (preset === 'random') {
      const newData = generateRandomData(pointsToGenerate);
      set({ chartData: newData, selectedPreset: 'custom' });
      return;
    }
    
    if (preset in sampleDataSets) {
      const originalData = sampleDataSets[preset];
      console.log(`Loading ${preset} preset: adjusting from ${originalData.data.length} to ${pointsToGenerate} points`);
      const adjustedData = adjustDataSetSize(originalData, pointsToGenerate);
      
      set({ 
        chartData: adjustedData,
        selectedPreset: preset 
      });
      return;
    }
    
    // Handle trend data
    if (['exponential', 'logarithmic'].includes(preset)) {
      const trendData = generateTrendData(
        preset,
        pointsToGenerate,
      );
      
      set({ chartData: trendData, selectedPreset: preset });
    }
  }
})); 