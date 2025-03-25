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
export const generateRandomData = (minPoints, maxExtraPoints) => {
  const dataPoints = minPoints + Math.floor(Math.random() * maxExtraPoints); 
  const newData = [];
  
  for (let i = 0; i < dataPoints; i++) {
    newData.push({
      x: dataLabels[i % dataLabels.length],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Create the data store with only data-related properties
export const useDataStore = create()((set) => ({
  // Data properties
  chartData: sampleDataSets.basic,
  selectedPreset: 'basic',
  
  // Data actions
  setChartData: (data) => set({ chartData: data }),
  setSelectedPreset: (preset) => set({ 
    selectedPreset: preset,
    chartData: sampleDataSets[preset]
  }),
  
  // Generate random data (works for any chart type)
  randomizeData: () => {
    const minPoints = 4;
    const maxExtraPoints = 6;
    
    const newData = generateRandomData(minPoints, maxExtraPoints);
    set({ chartData: newData, selectedPreset: 'custom' });
  },
  
  // Load preset data
  loadPresetData: (preset) => {
    if (preset === 'random') {
      const minPoints = 4;
      const maxExtraPoints = 6;
      
      const newData = generateRandomData(minPoints, maxExtraPoints);
      set({ chartData: newData, selectedPreset: 'custom' });
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
      const dataPoints = 7;
      
      const trendData = generateTrendData(
        preset,
        dataPoints,
      );
      
      set({ chartData: trendData, selectedPreset: preset });
    }
  }
})); 