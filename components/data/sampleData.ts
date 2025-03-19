import { ChartData } from '../templates/types';

// Data labels for random generation
export const dataLabels = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  categories: ['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat E', 'Cat F', 'Cat G', 'Cat H'],
};

// Generate a new dataset with a specific trend
export const generateTrendData = (trend: 'linear' | 'exponential' | 'logarithmic' | 'sinusoidal', numPoints: number = 7): ChartData => {
  const data: ChartData = [];
  
  switch (trend) {
    case 'linear':
      for (let i = 0; i < numPoints; i++) {
        data.push({
          x: dataLabels.months[i % 12],
          y: Math.floor(10 + (i * 90) / (numPoints - 1))
        });
      }
      break;
      
    case 'exponential':
      for (let i = 0; i < numPoints; i++) {
        // Exponential growth formula: y = a * e^(b*x)
        // Using a = 10, b = 0.4
        const x = i / (numPoints - 1);
        data.push({
          x: dataLabels.months[i % 12],
          y: Math.floor(10 * Math.exp(3 * x))
        });
      }
      break;
      
    case 'logarithmic':
      for (let i = 0; i < numPoints; i++) {
        // Logarithmic growth: y = a * ln(b*x + 1)
        // Using a = 30, b = 10
        const x = (i + 1) / numPoints;
        data.push({
          x: dataLabels.months[i % 12],
          y: Math.floor(30 * Math.log(10 * x + 1))
        });
      }
      break;
      
    case 'sinusoidal':
      for (let i = 0; i < numPoints; i++) {
        // Sine wave: y = a * sin(b*x) + c
        // Using a = 40, b = 2*π, c = 50
        const x = i / (numPoints - 1);
        data.push({
          x: dataLabels.months[i % 12],
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
export const generateRandomLineData = (): ChartData => {
  const dataPoints = 7 + Math.floor(Math.random() * 6); // Between 7-12 data points
  const newData: ChartData = [];
  
  for (let i = 0; i < dataPoints; i++) {
    newData.push({
      x: dataLabels.months[i % 12],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Generate random data for bar charts
export const generateRandomBarData = (): ChartData => {
  const dataPoints = 5 + Math.floor(Math.random() * 4); // Between 5-8 data points
  const newData: ChartData = [];
  
  for (let i = 0; i < dataPoints; i++) {
    newData.push({
      x: dataLabels.categories[i % dataLabels.categories.length],
      y: Math.floor(Math.random() * 100) // Random value between 0-100
    });
  }
  
  return newData;
};

// Data utility functions
export const getDataRange = (data: ChartData): { min: number, max: number } => {
  if (!data || data.length === 0) {
    return { min: 0, max: 100 };
  }
  
  const min = Math.min(...data.map(d => d.y));
  const max = Math.max(...data.map(d => d.y));
  
  return { min, max };
};

// Additional data utility functions

// Normalize data to a 0-1 scale
export const normalizeData = (data: ChartData): ChartData => {
  if (!data || data.length === 0) return [];
  
  const { min, max } = getDataRange(data);
  const range = max - min;
  
  if (range === 0) return data; // Avoid division by zero
  
  return data.map(point => ({
    x: point.x,
    y: (point.y - min) / range
  }));
};

// Scale data to fit within a specific range
export const scaleDataToRange = (data: ChartData, targetMin: number, targetMax: number): ChartData => {
  if (!data || data.length === 0) return [];
  
  const normalized = normalizeData(data);
  const targetRange = targetMax - targetMin;
  
  return normalized.map(point => ({
    x: point.x,
    y: point.y * targetRange + targetMin
  }));
};

// Sort data by x or y values
export const sortData = (data: ChartData, sortBy: 'x' | 'y' = 'x', ascending: boolean = true): ChartData => {
  if (!data || data.length === 0) return [];
  
  return [...data].sort((a, b) => {
    const aValue = sortBy === 'x' ? String(a.x) : a.y;
    const bValue = sortBy === 'x' ? String(b.x) : b.y;
    
    if (sortBy === 'x') {
      return ascending 
        ? String(aValue).localeCompare(String(bValue)) 
        : String(bValue).localeCompare(String(aValue));
    } else {
      return ascending 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });
}; 