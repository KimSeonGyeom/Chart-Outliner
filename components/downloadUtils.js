import html2canvas from 'html2canvas';

// Function to download chart as PNG/JPG
export const downloadChartAsImage = async (
  chartRef,
  fileName,
  fileType = 'png', // 'png' or 'jpg'
  asOutlines = true,
  forceFill = false,
  chartVersion = 'original' // 'original', 'cannyEdge', or 'both'
) => {
  if (!chartRef) return;
  
  try {
    // Handle the new ref structure - get the actual DOM element
    const chartElement = chartRef.chartContainer ? chartRef.chartContainer.current : chartRef.current;
    
    // Determine which SVG element to use based on chartVersion
    let svgElements = [];
    
    if (chartVersion === 'original' || chartVersion === 'both') {
      const originalSvg = chartRef.originalSvgRef ? chartRef.originalSvgRef.current : chartElement?.querySelector('svg');
      if (originalSvg) svgElements.push({ svg: originalSvg, suffix: '' });
    }
    
    if (chartVersion === 'cannyEdge' || chartVersion === 'both') {
      const cannyEdgeSvg = chartRef.cannyEdgeSvgRef ? chartRef.cannyEdgeSvgRef.current : chartElement?.querySelectorAll('svg')[1];
      if (cannyEdgeSvg) svgElements.push({ svg: cannyEdgeSvg, suffix: '-canny' });
    }
    
    if (svgElements.length === 0) {
      throw new Error('No SVG elements found in chart');
    }
    
    // Process each SVG element
    for (const { svg, suffix } of svgElements) {
      // Direct SVG to canvas conversion using XMLSerializer and Image
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      
      // Create a canvas with SVG dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = svg.clientWidth || svg.getAttribute('width') || 512;
      canvas.height = svg.clientHeight || svg.getAttribute('height') || 512;
      
      // Fill with white background if needed
      if (asOutlines) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // If forceFill is enabled, modify SVG content before conversion
      let modifiedSvgString = svgString;
      if (forceFill) {
        // Create a temporary DOM element to manipulate the SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgRoot = svgDoc.documentElement;
        
        // Set a white background
        svgRoot.setAttribute('style', 'background-color: white;');
        
        // Fill all bars with black
        const bars = svgRoot.querySelectorAll('.bar, .bars-group rect');
        bars.forEach(bar => {
          bar.setAttribute('fill', 'black');
          bar.setAttribute('fill-opacity', '1');
        });
        
        // Get the modified SVG string
        modifiedSvgString = serializer.serializeToString(svgRoot);
      }
      
      // Create a data URL from the SVG
      const svgBlob = new Blob([modifiedSvgString], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(svgBlob);
      
      // Create a new image and load the SVG into it
      const img = new Image();
      
      // Wait for image to load then draw to canvas
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.onerror = (e) => {
          console.error('Error loading SVG image:', e);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = url;
      });
      
      // Revoke the temporary URL
      URL.revokeObjectURL(url);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a download link
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${fileName}${suffix}.${fileType}`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }, 100);
        }
      }, fileType === 'jpg' ? 'image/jpeg' : 'image/png');
    }
  } catch (error) {
    console.error('Error downloading chart as image:', error);
  }
};

// Function to download chart as SVG
export const downloadChartAsSVG = async (
  chartRef,
  fileName,
  asOutlines = true,
  forceFill = false,
  chartVersion = 'original' // 'original', 'cannyEdge', or 'both'
) => {
  if (!chartRef) return;
  
  try {
    // Handle the new ref structure - get the actual DOM element
    const chartElement = chartRef.chartContainer ? chartRef.chartContainer.current : chartRef.current;
    
    // Determine which SVG element to use based on chartVersion
    let svgElements = [];
    
    if (chartVersion === 'original' || chartVersion === 'both') {
      const originalSvg = chartRef.originalSvgRef ? chartRef.originalSvgRef.current : chartElement?.querySelector('svg');
      if (originalSvg) svgElements.push({ svg: originalSvg, suffix: '' });
    }
    
    if (chartVersion === 'cannyEdge' || chartVersion === 'both') {
      const cannyEdgeSvg = chartRef.cannyEdgeSvgRef ? chartRef.cannyEdgeSvgRef.current : chartElement?.querySelectorAll('svg')[1];
      if (cannyEdgeSvg) svgElements.push({ svg: cannyEdgeSvg, suffix: '-canny' });
    }
    
    if (svgElements.length === 0) {
      throw new Error('No SVG elements found in chart');
    }
    
    // Process each SVG element
    for (const { svg, suffix } of svgElements) {
      // Clone the SVG to avoid modifying the original
      const svgClone = svg.cloneNode(true);
      
      // Apply white background and black fills if needed
      if (asOutlines) {
        svgClone.setAttribute('style', 'background-color: white;');
        
        if (forceFill) {
          // Fill all bar chart elements with black
          const bars = svgClone.querySelectorAll('.bar, .bars-group rect');
          if (bars.length > 0) {
            bars.forEach(bar => {
              bar.setAttribute('fill', 'black');
              bar.setAttribute('fill-opacity', '1');
            });
          }
        }
      }
      
      // Set proper dimensions if missing
      if (!svgClone.hasAttribute('width') || !svgClone.hasAttribute('height')) {
        const width = svg.clientWidth || 512;
        const height = svg.clientHeight || 512;
        svgClone.setAttribute('width', `${width}`);
        svgClone.setAttribute('height', `${height}`);
        // Only set viewBox if it doesn't already exist
        if (!svgClone.hasAttribute('viewBox')) {
          svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
      }
      
      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Download SVG file
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}${suffix}.svg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.error('Error downloading chart as SVG:', error);
  }
};

// Main download function
export const downloadChart = async (
  chartRef,
  fileName,
  fileType, // 'png' or 'svg'
  asOutlines = true,
  forceFill = false,
  chartVersion = 'original' // 'original', 'cannyEdge', or 'both'
) => {
  // Handle different types of chart references properly
  try {
    if (fileType === 'svg') {
      await downloadChartAsSVG(chartRef, fileName.trim(), asOutlines, forceFill, chartVersion);
    } else {
      await downloadChartAsImage(chartRef, fileName.trim(), fileType, asOutlines, forceFill, chartVersion);
    }
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
}; 