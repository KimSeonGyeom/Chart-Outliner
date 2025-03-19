import html2canvas from 'html2canvas';

// Function to download chart as PNG/JPG
export const downloadChartAsImage = async (
  chartRef: HTMLDivElement,
  fileName: string,
  fileType: 'png' | 'jpg',
  asOutlines: boolean = true
): Promise<void> => {
  if (!chartRef) return;
  
  try {
    // Check if the element contains an image
    const img = chartRef.querySelector('img');
    if (img) {
      // If we already have an image, we can use it directly for faster export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Fill with white background if needed
      if (asOutlines) {
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the image
      ctx!.drawImage(img, 0, 0);
      
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
    
    // Capture the chart as canvas
    const canvas = await html2canvas(chartRef, {
      backgroundColor: asOutlines ? '#FFFFFF' : 'transparent',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
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
  chartRef: HTMLDivElement,
  fileName: string,
  asOutlines: boolean = true
): Promise<void> => {
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
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the image
      ctx!.drawImage(img, 0, 0);
      
      // Convert canvas to SVG
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
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Apply white background and black outlines if needed
    if (asOutlines) {
      svgClone.setAttribute('style', 'background-color: white;');
      const paths = svgClone.querySelectorAll('path, line, rect, circle, polygon');
      paths.forEach(path => {
        // Preserve existing stroke if it has one, otherwise use black
        if (!path.hasAttribute('stroke') || path.getAttribute('stroke') === 'none') {
          path.setAttribute('stroke', 'black');
        }
        path.setAttribute('stroke-width', path.hasAttribute('stroke-width') ? path.getAttribute('stroke-width')! : '1');
        
        // For fill, keep existing fill with proper opacity if it's not 'none'
        if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
          path.setAttribute('fill-opacity', path.hasAttribute('fill-opacity') ? path.getAttribute('fill-opacity')! : '0.1');
        } else {
          path.setAttribute('fill', 'none');
        }
      });
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
  chartRef: HTMLDivElement | React.RefObject<HTMLDivElement>,
  fileName: string,
  fileType: 'png' | 'jpg' | 'svg',
  asOutlines: boolean = true
): Promise<void> => {
  // Handle both RefObject and direct HTMLDivElement
  const element = chartRef instanceof HTMLDivElement ? chartRef : chartRef.current;
  
  if (!element || !fileName.trim()) {
    console.error('Cannot download chart: Invalid chart reference or filename');
    return;
  }
  
  try {
    if (fileType === 'svg') {
      await downloadChartAsSVG(element, fileName.trim(), asOutlines);
    } else {
      await downloadChartAsImage(element, fileName.trim(), fileType, asOutlines);
    }
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
}; 