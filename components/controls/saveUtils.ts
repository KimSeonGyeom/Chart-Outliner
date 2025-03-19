import { SavedChartData } from '../gallery/types';
import { SaveChartConfig } from './types';

// Create a custom event name for chart updates
export const CHART_SAVED_EVENT = 'chart-saved';

// Save the chart as an image and store its configuration
export const saveChart = async (config: SaveChartConfig) => {
  const { chartRef, chartName, chartType, getChartConfig, onSaveSuccess, onSaveError } = config;
  
  if (!chartRef.current || !chartName.trim()) return;
  
  try {
    // Convert chart to image using html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    // Capture the chart as image
    const canvas = await html2canvas(chartRef.current);
    const imageUrl = canvas.toDataURL('image/png');
    
    // Get chart configuration
    const chartConfig = getChartConfig();
    
    // Create saved chart data
    const savedChart: SavedChartData = {
      id: Date.now().toString(),
      name: chartName.trim(),
      type: chartType,
      timestamp: Date.now(),
      imageUrl,
      config: chartConfig
    };
    
    // Get existing saved charts from localStorage
    const existingCharts = localStorage.getItem('savedCharts');
    let savedCharts: SavedChartData[] = [];
    if (existingCharts) {
      savedCharts = JSON.parse(existingCharts);
    }
    
    // Add new chart and save to localStorage
    savedCharts.push(savedChart);
    localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
    
    // Dispatch custom event for chart saved
    window.dispatchEvent(new CustomEvent(CHART_SAVED_EVENT, { detail: savedChart }));
    
    // Call success callback
    onSaveSuccess();
    
    return savedChart;
  } catch (error) {
    console.error('Error saving chart:', error);
    onSaveError(error);
    return null;
  }
}; 