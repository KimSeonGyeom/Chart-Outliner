import { create } from 'zustand';

// Data dataLabels for random generation
export const dataLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      
    case 'sinusoidal':
      for (let i = 0; i < numPoints; i++) {
        // Sine wave= a * sin(b*x) + c
        // Using a = 40, b = 2*π, c = 50
        const x = i / (numPoints - 1);
        data.push({
          x: dataLabels[i % dataLabels.length],
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
  // Add trend datasets
  exponential: generateTrendData('exponential'),
  logarithmic: generateTrendData('logarithmic'),
  sinusoidal: generateTrendData('sinusoidal'),
};

// Generate random data for any chart type
export const generateRandomData = (numPoints) => {
  const newData = [];
  
  for (let i = 0; i < numPoints; i++) {
    newData.push({
      x: dataLabels[i % dataLabels.length],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Adjust data set to match the desired number of points
export const adjustDataSetSize = (dataset, numPoints) => {
  if (dataset.length === numPoints) {
    return dataset; // No adjustment needed
  }
  
  // If we need to trim data points
  if (dataset.length > numPoints) {
    // Keep first and last points for trend consistency, and sample points in between
    if (numPoints < 3) {
      return dataset.slice(0, numPoints);
    }
    
    const result = [dataset[0]]; // Always include the first point
    
    // Calculate how many internal points to keep
    const internalPoints = numPoints - 2;
    const step = (dataset.length - 2) / internalPoints;
    
    // Add internal points at approximately even intervals
    for (let i = 1; i <= internalPoints; i++) {
      const index = Math.min(Math.floor(i * step) + 1, dataset.length - 2);
      result.push(dataset[index]);
    }
    
    result.push(dataset[dataset.length - 1]); // Always include the last point
    return result;
  }
  
  // If we need to add data points
  if (dataset.length < numPoints) {
    // Clone the original dataset
    const result = [...dataset];
    
    // Extend the data by interpolating between existing points
    while (result.length < numPoints) {
      const newData = [];
      
      // Keep all existing points
      for (let i = 0; i < result.length; i++) {
        newData.push(result[i]);
        
        // Add an interpolated point between each existing pair of points
        if (i < result.length - 1 && result.length < numPoints) {
          const currentX = result[i].x;
          const nextX = result[i + 1].x;
          const currentY = result[i].y;
          const nextY = result[i + 1].y;
          
          // Simple linear interpolation for y values
          const interpolatedY = Math.floor((currentY + nextY) / 2);
          
          // For x values, use the month labels
          const currentIndex = dataLabels.indexOf(currentX);
          let interpolatedIndex = (currentIndex + 1) % dataLabels.length;
          
          // Make sure the interpolated x doesn't already exist
          while (newData.some(d => d.x === dataLabels[interpolatedIndex])) {
            interpolatedIndex = (interpolatedIndex + 1) % dataLabels.length;
          }
          
          newData.push({
            x: dataLabels[interpolatedIndex],
            y: interpolatedY
          });
        }
      }
      
      // Break if we couldn't add any new points
      if (newData.length === result.length) break;
      
      result.length = 0;
      result.push(...newData);
    }
    
    // Trim if we added too many points
    return result.slice(0, numPoints);
  }
  
  return dataset;
};

// Create the data store with only data-related properties
export const useDataStore = create()((set, get) => ({
  // Data properties
  chartData: sampleDataSets.basic,
  selectedPreset: 'basic',
  numDataPoints: 5, // Default number of data points
  
  // Data actions
  setChartData: (data) => set({ chartData: data }),
  setSelectedPreset: (preset) => {
    const { numDataPoints } = get();
    // Ensure we're within our min/max bounds
    const pointsToGenerate = Math.max(3, Math.min(8, numDataPoints));
    
    // For trend data presets that support variable length
    if (['exponential', 'logarithmic', 'sinusoidal'].includes(preset)) {
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
      console.log(`Loading ${preset} preset: adjusting from ${originalData.length} to ${pointsToGenerate} points`);
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
  setNumDataPoints: (num) => set({ numDataPoints: num }),
  
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
      console.log(`Loading ${preset} preset: adjusting from ${originalData.length} to ${pointsToGenerate} points`);
      const adjustedData = adjustDataSetSize(originalData, pointsToGenerate);
      
      set({ 
        chartData: adjustedData,
        selectedPreset: preset 
      });
      return;
    }
    
    // Handle trend data
    if (['exponential', 'logarithmic', 'sinusoidal'].includes(preset)) {
      const trendData = generateTrendData(
        preset,
        pointsToGenerate,
      );
      
      set({ chartData: trendData, selectedPreset: preset });
    }
  }
})); 