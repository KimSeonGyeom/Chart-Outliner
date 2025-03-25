import React from 'react';
import * as d3 from 'd3';
import { sampleDataSets } from '../store/dataStore.js';

// Common options for chart export

/**
 * Bar chart specific variations object
 * @typedef {Object} BarChartVariation
 * @property {string} template - The template to use
 * @property {string} dataOption - The data option to use
 * @property {Array} data - The chart data
 * @property {string} fileName - Output file name
 * @property {string} fileType - Output file type
 */

/**
 * Line chart specific variations object
 * @typedef {Object} LineChartVariation
 * @property {string} curveType - Type of curve to use
 * @property {string} dataOption - The data option to use
 * @property {boolean} fill - Whether to fill the area under the line
 * @property {string} strokePattern - Pattern for the stroke
 * @property {string} strokeStyle - Style of the stroke
 * @property {number} strokeWidth - Width of the stroke
 * @property {string} fillPattern - Pattern for the fill
 * @property {number} fillZoomLevel - Zoom level for the fill pattern
 * @property {string} pointShape - Shape to use for data points
 * @property {Array} data - The chart data
 * @property {string} fileName - Output file name
 * @property {string} fileType - Output file type
 */

/**
 * Creates all combinations of bar chart variations with the specified templates,
 * data options, and current settings
 * @param chartRef - Reference to the chart container
 * @param currentSettings - Current bar chart settings to apply to all variations
 * @returns {Array} Array of bar chart variations
 */
export function generateBarChartVariations() {
  // Template options
  const templates = ['none', 'rectangle', 'circle', 'triangle', 'diamond'];
  
  // Pick three random data options from sample data sets
  const allDataOptions = Object.keys(sampleDataSets);
  const randomDataOptions = [];
  
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
  const variations = [];
  
  templates.forEach(template => {
    allDataOptions.forEach(dataOption => {
      variations.push({
        template,
        dataOption,
        data: sampleDataSets[dataOption],
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
 * @returns {Array} Array of line chart variations
 */
export function generateLineChartVariations() {
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
  const variations = [];
  
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
                  
                  // Select a random point shape
                  const pointShape = pointShapes[Math.floor(Math.random() * pointShapes.length)];
                  const strokeWidth = 2; // Default stroke width
                  const fillZoomLevel = zoomLevel;
                  
                  variations.push({
                    curveType,
                    dataOption,
                    fill,
                    strokePattern,
                    strokeStyle,
                    strokeWidth,
                    fillPattern,
                    fillZoomLevel,
                    pointShape,
                    data: sampleDataSets[dataOption],
                    fileName: `line-${curveType}-${dataOption}-${strokePattern}-${strokeStyle}${fill ? `-fill-${fillPattern}${fillPattern !== 'solid' ? `-zoom-${zoomLevel}` : ''}` : ''}`,
                    fileType: 'png'
                  });
                });
              });
            } else {
              // When fill is false, no fill pattern needed
              // Select a random point shape
              const pointShape = pointShapes[Math.floor(Math.random() * pointShapes.length)];
              const strokeWidth = 2; // Default stroke width
              
              variations.push({
                curveType,
                dataOption,
                fill,
                strokePattern,
                strokeStyle,
                strokeWidth,
                pointShape,
                data: sampleDataSets[dataOption],
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
 * @param {Object} barChartRef - Reference to the bar chart container
 * @param {Object} lineChartRef - Reference to the line chart container
 * @param {Function} downloadChartFn - Function to download a chart
 * @param {Function} setChartSettings - Function to apply chart settings
 * @param {Function} progressTracker - Optional callback for tracking export progress
 */
export async function exportAllChartVariations(
  barChartRef,
  lineChartRef,
  downloadChartFn,
  setChartSettings,
  progressTracker
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
        strokeWidth: variation.strokeWidth,
        fillPattern: variation.fillPattern || 'solid',
        fillZoomLevel: variation.fillZoomLevel,
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
 * @param {string} chartType - The type of chart to export variations for ('bar' or 'line')
 * @param {Object} chartRef - Reference to the chart container
 * @param {Function} downloadChartFn - Function to download a chart
 * @param {Function} setChartSettings - Function to apply chart settings
 * @param {Function} progressTracker - Optional callback for tracking export progress
 */
export async function exportChartVariations(
  chartType,
  chartRef,
  downloadChartFn,
  setChartSettings,
  progressTracker
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
        setChartSettings({
          templateName: variation.template,
          data: variation.data
        });
      } else {
        setChartSettings({
          curveType: variation.curveType,
          fill: variation.fill,
          strokePattern: variation.strokePattern,
          strokeStyle: variation.strokeStyle || 'normal',
          strokeWidth: variation.strokeWidth,
          fillPattern: variation.fillPattern || 'solid',
          fillZoomLevel: variation.fillZoomLevel,
          pointShape: variation.pointShape,
          data: variation.data
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