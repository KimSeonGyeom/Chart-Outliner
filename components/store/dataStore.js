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
    subject: 'cost of living',
    data: data,
  };
};

export const generateRandomSubject = () => {
  const subjects = ['cost of living', 'population growth', 'number of children tourists', 'climate change', 'area of forest', 'lack of water', 'wine production', 'visits in historical sites'];
  return subjects[Math.floor(Math.random() * subjects.length)];
};

// Sample datasets for charts
export const sampleDataSets = {
  basic: {
    subject: 'cost of living',
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
    subject: 'cost of living',
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
    subject: 'cost of living',
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
    subject: 'cost of living',
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
    subject: generateRandomSubject(),
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
    subject: dataset.subject,
    data: dataset.data.length > numPoints 
      ? dataset.data.slice(dataset.data.length - numPoints) 
      : dataset.data.slice(0, numPoints)
  };
};

// Create the data store with only data-related properties
export const useDataStore = create()((set, get) => ({
  // Data properties
  chartData: sampleDataSets.basic,
  visualInterpretation: 'null',
  authorIntention: 'null',
  selectedPreset: 'basic',
  numDataPoints: 5, // Default number of data points
  
  // Data actions
  setChartData: (data) => set({ chartData: data }),
  setVisualInterpretation: (interpretation) => set({ visualInterpretation: interpretation }),
  setAuthorIntention: (intention) => set({ authorIntention: intention }),
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