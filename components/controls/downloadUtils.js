import html2canvas from 'html2canvas';

// Function to download chart as PNG/JPG
export const downloadChartAsImage = async (
  chartRef,
  fileName,
  fileType = 'png', // 'png' or 'jpg'
  asOutlines = true,
  forceFill = false
) => {
  if (!chartRef) return;
  
  try {
    // Check if the element contains an image
    const img = chartRef.querySelector('img');
    if (img) {
      // If we already have an image, we can use it directly for faster export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Fill with white background if needed
      if (asOutlines) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.${fileType}`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }
      }, fileType === 'jpg' ? 'image/jpeg' : 'image/png');
      
      return;
    }
    
    // Set chart background style temporarily if asOutlines is true
    let originalBackgroundColor = '';
    if (asOutlines) {
      originalBackgroundColor = chartRef.style.backgroundColor;
      chartRef.style.backgroundColor = 'white';
    }
    
    // Find SVG element and handle forceFill if needed
    if (forceFill) {
      const svgElement = chartRef.querySelector('svg');
      if (svgElement) {
        // Handle line chart area specifically
        const areaElement = svgElement.querySelector('.area');
        const lineElement = svgElement.querySelector('.line');
        
        // Store original attributes to restore later
        const originalStates = [];
        
        // If this is a line chart with area
        if (lineElement) {
          // If there's no area element but we have a line, we need to create an area element
          if (!areaElement && lineElement) {
            // Get the chart-vis-group
            const chartVisGroup = svgElement.querySelector('.chart-vis-group');
            if (chartVisGroup) {
              // Find the innerHeight - used for y0 in area
              const gElement = svgElement.querySelector('g');
              const transform = gElement?.getAttribute('transform');
              const marginTopMatch = transform?.match(/translate\([\d\.]+,\s*([\d\.]+)\)/);
              const marginTop = marginTopMatch ? parseFloat(marginTopMatch[1]) : 20;
              
              // Estimate innerHeight from SVG height and margin
              const svgHeight = parseFloat(svgElement.getAttribute('height'));
              const axisHeight = svgElement.querySelector('g[transform*="translate(0,"]')?.getAttribute('transform');
              const innerHeightMatch = axisHeight?.match(/translate\(0,\s*([\d\.]+)\)/);
              const innerHeight = innerHeightMatch ? parseFloat(innerHeightMatch[1]) : (svgHeight - marginTop * 2);
              
              // Clone the line path to create an area
              const newArea = lineElement.cloneNode(true);
              newArea.setAttribute('class', 'area temporary-area');
              
              // Store original styles to restore later
              originalStates.push({
                element: newArea,
                isNew: true
              });
              
              // Create area by extending the path to the bottom
              const dAttr = lineElement.getAttribute('d');
              if (dAttr) {
                // Split path into points
                const pathParts = dAttr.split(/([MLHVCSQTAZmlhvcsqtaz])/g).filter(Boolean);
                let path = '';
                let i = 0;
                let firstX = null;
                let lastX = null;
                
                // Parse the path to find first and last x coordinates
                while (i < pathParts.length) {
                  const cmd = pathParts[i];
                  if (cmd === 'M' || cmd === 'm') {
                    const coords = pathParts[i+1].trim().split(/[\s,]+/);
                    if (coords.length >= 2) {
                      if (firstX === null) {
                        firstX = parseFloat(coords[0]);
                      }
                    }
                    i += 2;
                  } else if (cmd.match(/[LHCSQTA]/i)) {
                    // Any command with coordinates will advance
                    if (cmd === 'H' || cmd === 'h') {
                      const x = parseFloat(pathParts[i+1].trim());
                      lastX = x;
                    } else if (pathParts[i+1]) {
                      const coords = pathParts[i+1].trim().split(/[\s,]+/);
                      if (coords.length >= 1) {
                        lastX = parseFloat(coords[coords.length - 2] || coords[0]);
                      }
                    }
                    i += 2;
                  } else {
                    i++;
                  }
                }
                
                // Create a simplified area by adding line to bottom and back to start
                if (firstX !== null && lastX !== null) {
                  // Create area path by adding line to bottom right, bottom left, and back to start
                  const areaPath = `${dAttr} L ${lastX},${innerHeight} L ${firstX},${innerHeight} Z`;
                  newArea.setAttribute('d', areaPath);
                }
              }
              
              // Add the temporary area element
              chartVisGroup.insertBefore(newArea, lineElement);
            }
          }
          
          // Process all area elements (original and temporarily created)
          const areas = svgElement.querySelectorAll('.area');
          areas.forEach(area => {
            originalStates.push({
              element: area,
              fill: area.getAttribute('fill'),
              fillOpacity: area.getAttribute('fill-opacity'),
              isNew: false
            });
            
            // Apply black fill with 100% opacity
            area.setAttribute('fill', 'black');
            area.setAttribute('fill-opacity', '1');
          });
          
          // Also, points should be filled
          const points = svgElement.querySelectorAll('.point');
          points.forEach(point => {
            originalStates.push({
              element: point,
              fill: point.getAttribute('fill'),
              fillOpacity: point.getAttribute('fill-opacity'),
              isNew: false
            });
            
            // Apply black fill to points
            point.setAttribute('fill', 'black');
            point.setAttribute('fill-opacity', '1');
          });
        } else {
          // For bar charts and other charts
          const chartElements = svgElement.querySelectorAll('.bar, .line, .area, .point, .bars-group path, .chart-vis-group path');
          
          chartElements.forEach(element => {
            originalStates.push({
              element,
              fill: element.getAttribute('fill'),
              fillOpacity: element.getAttribute('fill-opacity'),
              isNew: false
            });
            
            // Apply black fill with 100% opacity
            element.setAttribute('fill', 'black');
            element.setAttribute('fill-opacity', '1');
          });
        }
        
        // Capture the chart
        const canvas = await html2canvas(chartRef, {
          backgroundColor: asOutlines ? '#FFFFFF' : 'transparent',
          scale: 2 // Original size with 2x scale for better quality
        });
        
        // Restore original attributes or remove temporary elements
        originalStates.forEach(state => {
          if (state.isNew) {
            // Remove temporary elements
            state.element.parentNode?.removeChild(state.element);
          } else {
            // Restore original attributes
            if (state.fill) {
              state.element.setAttribute('fill', state.fill);
            } else {
              state.element.removeAttribute('fill');
            }
            
            if (state.fillOpacity) {
              state.element.setAttribute('fill-opacity', state.fillOpacity);
            } else {
              state.element.removeAttribute('fill-opacity');
            }
          }
        });
        
        // Restore original background if it was changed
        if (asOutlines && originalBackgroundColor !== '') {
          chartRef.style.backgroundColor = originalBackgroundColor;
        }
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.${fileType}`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 100);
          }
        }, fileType === 'jpg' ? 'image/jpeg' : 'image/png');
        
        return;
      }
    }
    
    // Regular capture for non-forceFill cases
    // Capture the chart
    const canvas = await html2canvas(chartRef, {
      backgroundColor: asOutlines ? '#FFFFFF' : 'transparent',
      scale: 2 // Original size with 2x scale for better quality
    });
    
    // Restore original background if it was changed
    if (asOutlines && originalBackgroundColor !== '') {
      chartRef.style.backgroundColor = originalBackgroundColor;
    }
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${fileType}`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }
    }, fileType === 'jpg' ? 'image/jpeg' : 'image/png');
  } catch (error) {
    console.error('Error downloading chart as image:', error);
  }
};

// Function to download chart as SVG
export const downloadChartAsSVG = async (
  chartRef,
  fileName,
  asOutlines = true,
  forceFill = false
) => {
  if (!chartRef) return;
  
  try {
    // Check if element contains an image (which may be from a png/jpg and not SVG)
    const img = chartRef.querySelector('img');
    if (img) {
      // For images, we'll convert to SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Fill with white background if needed
      if (asOutlines) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to an SVG string
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <img src="${canvas.toDataURL('image/png')}" width="100%" height="100%" />
          </div>
        </foreignObject>
      </svg>`;
      
      // Download SVG file
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.svg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return;
    }
    
    // Find SVG element inside the chart container
    const svgElement = chartRef.querySelector('svg');
    if (!svgElement) {
      console.error('No SVG element found in the chart container');
      return;
    }
    
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);
    
    // Apply white background and black outlines if needed
    if (asOutlines) {
      svgClone.setAttribute('style', 'background-color: white;');
      
      // Get all paths but filter out axes paths if forceFill is true
      if (forceFill) {
        // Check if this is a line chart
        const lineElement = svgClone.querySelector('.line');
        
        if (lineElement) {
          // This is likely a line chart
          const chartVisGroup = svgClone.querySelector('.chart-vis-group');
          const areaElement = svgClone.querySelector('.area');
          
          // If there's no area element, we need to create one
          if (!areaElement && chartVisGroup) {
            // Find the innerHeight - used for y0 in area
            const gElement = svgClone.querySelector('g');
            const transform = gElement?.getAttribute('transform');
            const marginTopMatch = transform?.match(/translate\([\d\.]+,\s*([\d\.]+)\)/);
            const marginTop = marginTopMatch ? parseFloat(marginTopMatch[1]) : 20;
            
            // Estimate innerHeight from SVG height and margin
            const svgHeight = parseFloat(svgClone.getAttribute('height'));
            const axisHeight = svgClone.querySelector('g[transform*="translate(0,"]')?.getAttribute('transform');
            const innerHeightMatch = axisHeight?.match(/translate\(0,\s*([\d\.]+)\)/);
            const innerHeight = innerHeightMatch ? parseFloat(innerHeightMatch[1]) : (svgHeight - marginTop * 2);
            
            // Clone the line path to create an area
            const newArea = lineElement.cloneNode(true);
            newArea.setAttribute('class', 'area');
            
            // Create area by extending the path to the bottom
            const dAttr = lineElement.getAttribute('d');
            if (dAttr) {
              // Split path into points
              const pathParts = dAttr.split(/([MLHVCSQTAZmlhvcsqtaz])/g).filter(Boolean);
              let firstX = null;
              let lastX = null;
              let i = 0;
              
              // Parse the path to find first and last x coordinates
              while (i < pathParts.length) {
                const cmd = pathParts[i];
                if (cmd === 'M' || cmd === 'm') {
                  const coords = pathParts[i+1].trim().split(/[\s,]+/);
                  if (coords.length >= 2) {
                    if (firstX === null) {
                      firstX = parseFloat(coords[0]);
                    }
                  }
                  i += 2;
                } else if (cmd.match(/[LHCSQTA]/i)) {
                  // Any command with coordinates will advance
                  if (cmd === 'H' || cmd === 'h') {
                    const x = parseFloat(pathParts[i+1].trim());
                    lastX = x;
                  } else if (pathParts[i+1]) {
                    const coords = pathParts[i+1].trim().split(/[\s,]+/);
                    if (coords.length >= 1) {
                      lastX = parseFloat(coords[coords.length - 2] || coords[0]);
                    }
                  }
                  i += 2;
                } else {
                  i++;
                }
              }
              
              // Create a simplified area by adding line to bottom and back to start
              if (firstX !== null && lastX !== null) {
                // Create area path by adding line to bottom right, bottom left, and back to start
                const areaPath = `${dAttr} L ${lastX},${innerHeight} L ${firstX},${innerHeight} Z`;
                newArea.setAttribute('d', areaPath);
              }
            }
            
            // Set fill properties
            newArea.setAttribute('fill', 'black');
            newArea.setAttribute('fill-opacity', '1');
            
            // Add the area before the line to ensure the line is drawn on top
            chartVisGroup.insertBefore(newArea, lineElement);
          } else if (areaElement) {
            // Area already exists, make sure it's filled solid black
            areaElement.setAttribute('fill', 'black');
            areaElement.setAttribute('fill-opacity', '1');
          }
          
          // Style the line and points
          lineElement.setAttribute('stroke', 'black');
          lineElement.setAttribute('stroke-width', lineElement.getAttribute('stroke-width') || '1');
          
          // Fill any points
          const points = svgClone.querySelectorAll('.point');
          points.forEach(point => {
            point.setAttribute('fill', 'black');
            point.setAttribute('fill-opacity', '1');
          });
        } else {
          // For other charts like bar charts
          // Select only chart data elements (bars, lines, areas, points)
          const chartElements = svgClone.querySelectorAll('.bar, .line, .area, .point, .bars-group path, .chart-vis-group path');
          chartElements.forEach(element => {
            // Preserve existing stroke if it has one
            if (!element.hasAttribute('stroke') || element.getAttribute('stroke') === 'none') {
              element.setAttribute('stroke', 'black');
            }
            
            element.setAttribute('stroke-width', element.hasAttribute('stroke-width') ? element.getAttribute('stroke-width') : '1');
            
            // Apply fill to chart data elements
            element.setAttribute('fill', 'black');
            element.setAttribute('fill-opacity', '1');
          });
        }
        
        // Process non-chart elements (axes, etc.)
        const allPaths = svgClone.querySelectorAll('path, line, rect, circle, polygon');
        allPaths.forEach(path => {
          // Skip chart elements that we already processed
          if (path.classList.contains('bar') || 
              path.classList.contains('line') || 
              path.classList.contains('area') || 
              path.classList.contains('point') ||
              path.parentElement.classList.contains('bars-group') ||
              path.parentElement.classList.contains('chart-vis-group')) {
            return;
          }
          
          // Style non-chart elements normally
          if (!path.hasAttribute('stroke') || path.getAttribute('stroke') === 'none') {
            path.setAttribute('stroke', 'black');
          }
          
          path.setAttribute('stroke-width', path.hasAttribute('stroke-width') ? path.getAttribute('stroke-width') : '1');
          
          if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
            path.setAttribute('fill-opacity', path.hasAttribute('fill-opacity') ? path.getAttribute('fill-opacity') : '0.1');
          } else {
            path.setAttribute('fill', 'none');
          }
        });
      } else {
        // Regular styling for all paths if not forceFill
        const paths = svgClone.querySelectorAll('path, line, rect, circle, polygon');
        paths.forEach(path => {
          // Preserve existing stroke if it has one
          if (!path.hasAttribute('stroke') || path.getAttribute('stroke') === 'none') {
            path.setAttribute('stroke', 'black');
          }
          
          path.setAttribute('stroke-width', path.hasAttribute('stroke-width') ? path.getAttribute('stroke-width') : '1');
          
          // For fill, keep existing fill with proper opacity if it's not 'none'
          if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
            path.setAttribute('fill-opacity', path.hasAttribute('fill-opacity') ? path.getAttribute('fill-opacity') : '0.1');
          } else {
            path.setAttribute('fill', 'none');
          }
        });
      }
    }
    
    // Set proper dimensions if missing
    if (!svgClone.hasAttribute('width') || !svgClone.hasAttribute('height')) {
      const bbox = svgElement.getBBox();
      svgClone.setAttribute('width', `${bbox.width}`);
      svgClone.setAttribute('height', `${bbox.height}`);
      svgClone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }
    
    // Serialize SVG to string
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    // Download SVG file
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading chart as SVG:', error);
  }
};

// Main download function
export const downloadChart = async (
  chartRef,
  fileName,
  fileType, // 'png', 'jpg', or 'svg'
  asOutlines = true,
  forceFill = false
) => {
  // Handle both RefObject and direct HTMLDivElement
  const element = chartRef instanceof HTMLDivElement ? chartRef : chartRef.current;
  
  if (!element || !fileName.trim()) {
    console.error('Cannot download chart: Invalid chart reference or filename');
    return;
  }
  
  try {
    if (fileType === 'svg') {
      await downloadChartAsSVG(element, fileName.trim(), asOutlines, forceFill);
    } else {
      await downloadChartAsImage(element, fileName.trim(), fileType, asOutlines, forceFill);
    }
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
}; 