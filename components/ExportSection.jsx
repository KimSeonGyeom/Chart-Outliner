"use client";

import { downloadChart } from './downloadUtils.js';
import { useChartStore } from './store/chartStore.js';
import { useAiStore } from './store/aiStore.js';
import { useDataStore } from './store/dataStore.js';

export default function ExportSection({ chartRef }) {
  const exportFileType = useChartStore(state => state.exportFileType);
  const setExportOption = useChartStore(state => state.setExportOption);
  const selectedEdgeImageData = useAiStore(state => state.selectedEdgeImageData);
  const processedEdgeImages = useAiStore(state => state.edgeImageData_Processed);
  const processingParams = useAiStore(state => state.processingParams);
  
  // Get data store functions for export all variations
  const setNumDataPoints = useDataStore(state => state.setNumDataPoints);
  const loadPresetData = useDataStore(state => state.loadPresetData);
  
  const handleExport = () => {
    // Generate a filename with timestamp
    const fileName = `chart-outliner-${Date.now()}`;
    setExportOption('exportFileName', fileName);
    
    if (chartRef && chartRef.current) {
      // Check if the Canny edge version is available
      const hasCannyEdge = selectedEdgeImageData !== null;
      
      if (hasCannyEdge) {
        // Export both original and Canny edge versions at once
        downloadChart(
          chartRef.current, 
          fileName, 
          exportFileType,
          true,   // asOutlines (default)
          false,  // forceFill
          'both'  // chartVersion - export both normal and canny edge
        ).catch(error => {
          console.error('Error exporting charts:', error);
        });
      } else {
        // Just export the original chart if no Canny edge is selected
        downloadChart(
          chartRef.current, 
          fileName, 
          exportFileType
        ).catch(error => {
          console.error('Error exporting chart:', error);
        });
      }
      
      // Always export filled version with modified filename
      downloadChart(
        chartRef.current, 
        `${fileName}-filled`, 
        exportFileType,
        true,  // asOutlines (default)
        true,  // forceFill (force black fill)
        'original' // chartVersion - only filled version for original
      ).catch(error => {
        console.error('Error exporting filled chart:', error);
      });
    }
  };

  const handleExportAllVariations = async () => {
    // Export one filled version and three canny edge versions for all data types, 3-6 number data points, assets with names of "apartment", "bottle", "thin_man", "pine_tree" with gap = 0.05
    // To sum up, there are 4 (data type: rising, falling, wave, logarithmic) x 3 (canny edge versions: default, sparse, blur) x 4 (variations of data point numbers) x 4 (assets) = 192 files to export
    // Export the files at once, and name them as "${Date.now()}-{data type}-{canny edge version}-{data point number}-{asset name}"
    // Export the files in the same directory as the original chart

    // const dataTypes = ['rising', 'falling', 'wave', 'logarithmic'];
    const dataTypes = ['logarithmic'];
    // const edgeVersions = ['default', 'sparse', 'blur'];
    const edgeVersions = ['blur'];
    // const dataPointCounts = [3, 4, 5, 6];
    const dataPointCounts = [7];
    // const assets = ['apartment'];
    const assets = ['softcone', 'bottle', 'thin_man', 'palm_tree', 'stack_of_coins', 'pill_container', 'castle_tower', 'balloon', 'cactus'];
    // const timestamp = Date.now().toString().slice(-8);
    // const topEdgeWidthScales = [0.4, 0.6, 0.8];
    const topEdgeWidthScales = [0.8];

    // Check if chart reference exists
    if (!chartRef || !chartRef.current) {
      console.error('Chart reference is not available');
      return;
    }

    // Set the starting batch counter
    let batchCounter = 0;
    let totalExports = dataTypes.length * edgeVersions.length * dataPointCounts.length * assets.length * topEdgeWidthScales.length;
    console.log(`Starting export of ${totalExports} variations...`);

    // Helper function to wait between exports to prevent browser freezing
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Store the original selected edge image to restore it later
    const originalSelectedEdgeImage = useAiStore.getState().selectedEdgeImageData;
    
    // Store original topEdgeImageWidthScale to restore later
    const originalTopEdgeWidthScale = useChartStore.getState().topEdgeImageWidthScale;
    
    // Store original bottom edge image
    const originalBottomEdgeImage = useAiStore.getState().bottom_edge_image;

    // Loop through all combinations
    for (const dataType of dataTypes) {
      for (const dataPointCount of dataPointCounts) {
        // Change the number of data points first
        setNumDataPoints(dataPointCount);
        
        // Load the corresponding data preset for this iteration
        loadPresetData(dataType);
        
        // Allow time for the chart to update
        await wait(300);

        // Export the filled version first (no edge images)
        const fileName_filled = `${dataType}-${dataPointCount}`;
        await downloadChart(
          chartRef.current,
          fileName_filled,
          exportFileType,
          true,   // asOutlines (default)
          true,   // forceFill (force black fill)
          'original' // chartVersion - only filled version for original
        ).catch(error => {
          console.error(`Error exporting filled chart for ${fileName_filled}:`, error);
        });
        
        for (const asset of assets) {
          console.log(`Processing asset: ${asset}`);
          
          // Process the asset image with the backend (only once per asset)
          try {
            // We're only doing basic edge processing without the topEdgeWidthScale
            const response = await fetch('http://localhost:5000/api/process-template', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                template_filename: `${asset}.png`,
                processing_params: processingParams
              }),
            });
            
            if (!response.ok) {
              console.error(`Error processing asset image ${asset}:`, response.status);
              continue; // Skip to next asset if this one fails
            }
            
            const data = await response.json();
            
            // Check if we got the processed edge images from the backend
            if (!data.processed_edges) {
              console.error(`No processed edges returned for asset ${asset}`);
              continue;
            }
            
            // Save the processed edge images to the store so they can be used by the chart
            useAiStore.getState().setAllProcessedEdgeImages(data.processed_edges);
            
            // For each topEdgeWidthScale value
            for (const topEdgeWidthScale of topEdgeWidthScales) {
              // Set the topEdgeWidthScale in the chart store
              useChartStore.getState().setTopEdgeImageWidthScale(topEdgeWidthScale);
              
              // Allow time for chart updates
              await wait(150);
              
              // For each edge version (default, sparsification/sparse, blur)
              for (const edgeVersion of edgeVersions) {
                // Generate a unique filename for this combination
                const fileName = `${dataType}-${dataPointCount}-${edgeVersion}-${asset}-scale${topEdgeWidthScale}`;
                
                // Get the edge image data for this version
                const edgeImageKey = edgeVersion === 'sparse' ? 'sparsification' : edgeVersion;
                
                // For the edge image, look for the full image
                const edgeImageData = data.processed_edges[edgeImageKey];
                
                // For the top edge, specifically look for the 'top' version
                const topEdgeImageKey = `${edgeImageKey}_top`;
                const topEdgeImageData = data.processed_edges[topEdgeImageKey];
                
                // For the bottom edge, specifically look for the 'bottom' version
                const bottomEdgeImageKey = `${edgeImageKey}_bottom`;
                const bottomEdgeImageData = data.processed_edges[bottomEdgeImageKey];
                
                if (edgeImageData && topEdgeImageData) {
                  // Apply these specific edge images to the state
                  useAiStore.getState().setSelectedEdgeImageData(edgeImageData);
                  useAiStore.getState().setTopEdgeImage(topEdgeImageData);
                  
                  // Set bottom edge image if available
                  if (bottomEdgeImageData) {
                    useAiStore.getState().setBottomEdgeImage(bottomEdgeImageData);
                  }
                  
                  // Wait for the UI to update with the new edge image
                  await wait(300);
                  
                  // Export the chart with this edge image
                  try {
                    await downloadChart(
                      chartRef.current,
                      fileName,
                      exportFileType,
                      true,   // asOutlines (default)
                      false,  // forceFill
                      'cannyEdge' // chartVersion - only canny edge version
                    );
                    console.log(`Successfully exported ${edgeVersion} edge version for ${fileName}`);
                  } catch (error) {
                    console.error(`Error exporting ${edgeVersion} canny edge chart for ${fileName}:`, error);
                  }
                } else {
                  console.error(`Edge image data for ${edgeVersion} not found for asset ${asset}`);
                  console.log('Available processed edges:', Object.keys(data.processed_edges));
                }
                
                // Increment the batch counter
                batchCounter++;
                
                // Log progress
                if (batchCounter % 10 === 0) {
                  console.log(`Exported ${batchCounter}/${totalExports} variations...`);
                  // Give the browser a chance to breathe
                  await wait(300);
                }
              }
            }
          } catch (error) {
            console.error(`Error processing asset ${asset}:`, error);
          }
        }
      }
    }
    
    // Restore the original selected edge image
    useAiStore.getState().setSelectedEdgeImageData(originalSelectedEdgeImage);
    
    // Restore the original topEdgeImageWidthScale value
    useChartStore.getState().setTopEdgeImageWidthScale(originalTopEdgeWidthScale);
    
    // Restore the original bottom edge image
    useAiStore.getState().setBottomEdgeImage(originalBottomEdgeImage);

    console.log(`Export complete! Generated ${batchCounter} variations.`);
  }

  return (
    <div className="export-section">
      <div className="radio-group">
        <input
          type="radio"
          id="png-option"
          name="export-type"
          value="png"
          checked={exportFileType === 'png'}
          onChange={() => setExportOption('exportFileType', 'png')}
        />
        <label htmlFor="png-option">PNG</label>
      </div>
      <div className="radio-group">
        <input
          type="radio" 
          id="svg-option"
          name="export-type"
          value="svg"
          checked={exportFileType === 'svg'}
          onChange={() => setExportOption('exportFileType', 'svg')}
        />
        <label htmlFor="svg-option">SVG</label>
      </div>
      <button className="export-button" onClick={handleExport}>
        Export
      </button>
      <button className="export-button" onClick={handleExportAllVariations}>
        Export All Variations
      </button>
    </div>
  );
} 