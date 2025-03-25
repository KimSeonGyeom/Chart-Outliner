import React from 'react';
import * as d3 from 'd3';
import { ChartData } from '../templates/types';
import { sampleDataSets } from '../store/dataStore';

// Common interface for chart export variations
interface ChartExportOptions {
  fileName: string;
  fileType: 'png' | 'jpg' | 'svg';
}

// Bar chart specific variations
interface BarChartVariation extends ChartExportOptions {
  template: string;
  dataOption: string;
  data: ChartData;
}

// Line chart specific variations
interface LineChartVariation extends ChartExportOptions {
  curveType?: string;
  dataOption?: string;
  fill?: boolean;
  strokePattern?: string;
  strokeStyle?: string;
  strokeWidth?: number;
  fillPattern?: string;
  fillZoomLevel?: number;
  pointShape?: string;
  data: ChartData;
}

/**
 * Creates all combinations of bar chart variations with the specified templates,
 * data options, and current settings
 * @param chartRef - Reference to the chart container
 * @param currentSettings - Current bar chart settings to apply to all variations
 * @returns Array of bar chart variations
 */
export function generateBarChartVariations(): BarChartVariation[] {
  // Template options
  const templates = ['none', 'rectangle', 'circle', 'triangle', 'diamond'];
  
  // Pick three random data options from sample data sets
  const allDataOptions = Object.keys(sampleDataSets);
  const randomDataOptions: string[] = [];
  
  // // Ensure we don't exceed available options
  // const numOptions = Math.min(3, allDataOptions.length);
  
  // // Select random data options without repeating
  // while (randomDataOptions.length < numOptions) {
  //   const randomIndex = Math.floor(Math.random() * allDataOptions.length);
  //   const option = allDataOptions[randomIndex];
    
  //   if (!randomDataOptions.includes(option)) {
  //     randomDataOptions.push(option);
  //   }
  // }
  
  // Generate all combinations
  const variations: BarChartVariation[] = [];
  
  templates.forEach(template => {
    allDataOptions.forEach(dataOption => {
      variations.push({
        template,
        dataOption,
        data: sampleDataSets[dataOption as keyof typeof sampleDataSets],
        fileName: `bar-${template}-${dataOption}`,
        fileType: 'png'
      });
    });
  });
  
  return variations;
}

/**
 * Creates all combinations of line chart variations with different curve types,
 * data options, and fill settings
 * @param chartRef - Reference to the chart container
 * @param currentSettings - Current line chart settings to apply to all variations
 * @returns Array of line chart variations
 */
export function generateLineChartVariations(): LineChartVariation[] {
  // Curve type options
  const curveTypes = ['cardinal', 'basis', 'natural', 'monotone', 'catmullRom', 'linear'];
  
  // Fill options
  const fillOptions = [true, false];
  
  // Stroke pattern options
  const strokePatterns = ['solid', 'dashed', 'dotted'];
  
  // Stroke style options (only use a subset for variations to avoid too many combinations)
  const strokeStyles = ['normal', 'brush'];
  
  // Fill pattern options (only used when fill is true)
  const fillPatterns = ['solid', 'diagonal', 'dots', 'crosshatch'];
  
  // Point shape options
  const pointShapes = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
  
  // Pick three random data options from sample data sets
  const allDataOptions = Object.keys(sampleDataSets);
  
  // Generate all combinations
  const variations: LineChartVariation[] = [];
  
  curveTypes.forEach(curveType => {
    allDataOptions.forEach(dataOption => {
      fillOptions.forEach(fill => {
        strokePatterns.forEach(strokePattern => {
          strokeStyles.forEach(strokeStyle => {
            if (fill) {
              // When fill is true, try different fill patterns
              fillPatterns.forEach(fillPattern => {
                // Add variations with different zoom levels for each pattern
                [4, 20].forEach(zoomLevel => {
                  // Skip zoom level variations for solid fills
                  if (fillPattern === 'solid' && zoomLevel !== 10) return;
                  
                  variations.push({
                    curveType,
                    dataOption,
                    fill,
                    strokePattern,
                    strokeStyle,
                    strokeWidth: 1,
                    fillPattern,
                    fillZoomLevel: zoomLevel,
                    pointShape: pointShapes[Math.floor(Math.random() * pointShapes.length)],
                    data: sampleDataSets[dataOption as keyof typeof sampleDataSets],
                    fileName: `line-${curveType}-${dataOption}-${strokePattern}-${strokeStyle}${fill ? `-fill-${fillPattern}${fillPattern !== 'solid' ? `-zoom-${zoomLevel}` : ''}` : ''}`,
                    fileType: 'png'
                  });
                });
              });
            } else {
              // When fill is false, no fill pattern needed
              variations.push({
                curveType,
                dataOption,
                fill,
                strokePattern,
                strokeStyle,
                strokeWidth: 1,
                pointShape: pointShapes[Math.floor(Math.random() * pointShapes.length)],
                data: sampleDataSets[dataOption as keyof typeof sampleDataSets],
                fileName: `line-${curveType}-${dataOption}-${strokePattern}-${strokeStyle}`,
                fileType: 'png'
              });
            }
          });
        });
      });
    });
  });
  
  return variations;
}

/**
 * Exports all chart variations for both bar and line charts
 * @param barChartRef - Reference to the bar chart container
 * @param lineChartRef - Reference to the line chart container
 * @param downloadChartFn - Function to download a chart
 * @param setChartSettings - Function to apply chart settings
 * @param progressTracker - Optional callback for tracking export progress
 */
export async function exportAllChartVariations(
  barChartRef: React.RefObject<HTMLDivElement>,
  lineChartRef: React.RefObject<HTMLDivElement>,
  downloadChartFn: (ref: React.RefObject<HTMLDivElement>, fileName: string, fileType: 'png' | 'jpg' | 'svg') => Promise<void>,
  setChartSettings: (chartType: 'bar' | 'line', settings: any) => void,
  progressTracker?: (current: number, total: number) => void
) {
  // Generate variations
  const barVariations = generateBarChartVariations();
  const lineVariations = generateLineChartVariations();
  
  // Calculate total variations
  const totalVariations = barVariations.length + lineVariations.length;
  let currentProgress = 0;
  
  // Report initial progress
  if (progressTracker) {
    progressTracker(currentProgress, totalVariations);
  }
  
  // Export bar chart variations
  console.log(`Exporting ${barVariations.length} bar chart variations...`);
  for (const variation of barVariations) {
    try {
      // Apply settings
      setChartSettings('bar', {
        templateName: variation.template,
        data: variation.data
      });
      
      // Delay to allow rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Export
      await downloadChartFn(barChartRef, variation.fileName, variation.fileType);
      
      // Update progress
      currentProgress++;
      if (progressTracker) {
        progressTracker(currentProgress, totalVariations);
      }
      
      console.log(`Exported: ${variation.fileName}.${variation.fileType}`);
    } catch (error) {
      console.error(`Failed to export ${variation.fileName}:`, error);
    }
  }
  
  // Export line chart variations
  console.log(`Exporting ${lineVariations.length} line chart variations...`);
  for (const variation of lineVariations) {
    try {
      // Apply settings
      setChartSettings('line', {
        curveType: variation.curveType,
        fill: variation.fill,
        strokePattern: variation.strokePattern,
        strokeStyle: variation.strokeStyle || 'normal',
        strokeWidth: variation.strokeWidth || 1,
        fillPattern: variation.fillPattern || 'solid',
        fillZoomLevel: variation.fillZoomLevel || 8,
        pointShape: variation.pointShape,
        data: variation.data
      });
      
      // Delay to allow rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Export
      await downloadChartFn(lineChartRef, variation.fileName, variation.fileType);
      
      // Update progress
      currentProgress++;
      if (progressTracker) {
        progressTracker(currentProgress, totalVariations);
      }
      
      console.log(`Exported: ${variation.fileName}.${variation.fileType}`);
    } catch (error) {
      console.error(`Failed to export ${variation.fileName}:`, error);
    }
  }
  
  console.log('All chart variations exported successfully!');
}

/**
 * Exports variations for a single chart type (bar or line)
 * @param chartType - The type of chart to export variations for ('bar' or 'line')
 * @param chartRef - Reference to the chart container
 * @param downloadChartFn - Function to download a chart
 * @param setChartSettings - Function to apply chart settings
 * @param progressTracker - Optional callback for tracking export progress
 */
export async function exportChartVariations(
  chartType: 'bar' | 'line',
  chartRef: React.RefObject<HTMLDivElement>,
  downloadChartFn: (ref: React.RefObject<HTMLDivElement>, fileName: string, fileType: 'png' | 'jpg' | 'svg') => Promise<void>,
  setChartSettings: (settings: any) => void,
  progressTracker?: (current: number, total: number) => void
) {
  // Generate variations based on chart type
  const variations = chartType === 'bar' 
    ? generateBarChartVariations()
    : generateLineChartVariations();
  
  // Calculate total variations
  const totalVariations = variations.length;
  let currentProgress = 0;
  
  // Report initial progress
  if (progressTracker) {
    progressTracker(currentProgress, totalVariations);
  }
  
  // Export chart variations
  console.log(`Exporting ${variations.length} ${chartType} chart variations...`);
  
  for (const variation of variations) {
    try {
      // Apply settings based on chart type
      if (chartType === 'bar') {
        const barVariation = variation as BarChartVariation;
        setChartSettings({
          templateName: barVariation.template,
          data: barVariation.data
        });
      } else {
        const lineVariation = variation as LineChartVariation;
        setChartSettings({
          curveType: lineVariation.curveType,
          fill: lineVariation.fill,
          strokePattern: lineVariation.strokePattern,
          strokeStyle: lineVariation.strokeStyle || 'normal',
          strokeWidth: lineVariation.strokeWidth || 1,
          fillPattern: lineVariation.fillPattern || 'solid',
          fillZoomLevel: lineVariation.fillZoomLevel || 8,
          pointShape: lineVariation.pointShape,
          data: lineVariation.data
        });
      }
      
      // Delay to allow rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Export
      await downloadChartFn(chartRef, variation.fileName, variation.fileType);
      
      // Update progress
      currentProgress++;
      if (progressTracker) {
        progressTracker(currentProgress, totalVariations);
      }
      
      console.log(`Exported: ${variation.fileName}.${variation.fileType}`);
    } catch (error) {
      console.error(`Failed to export ${variation.fileName}:`, error);
    }
  }
  
  console.log(`All ${chartType} chart variations exported successfully!`);
} 