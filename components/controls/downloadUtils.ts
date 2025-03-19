import html2canvas from 'html2canvas';

// Function to download chart as PNG/JPG
export const downloadChartAsImage = async (
  chartRef: HTMLDivElement,
  fileName: string,
  fileType: 'png' | 'jpg',
  asOutlines: boolean,
  wireframeStyle?: boolean
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
      if (asOutlines || wireframeStyle) {
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
    
    // Apply wireframe styling if requested
    let originalStyles: {elements: HTMLElement[], styles: {[key: string]: string}[]} | null = null;
    
    if (wireframeStyle) {
      // Store original styles to restore later
      originalStyles = {elements: [], styles: []};
      
      // Select all SVG elements in the chart
      const svgElements = chartRef.querySelectorAll('svg *');
      
      // Apply wireframe styling to each element
      svgElements.forEach((el: Element) => {
        const computedStyle = window.getComputedStyle(el as HTMLElement);
        const originalStyle = {
          fill: computedStyle.fill,
          stroke: computedStyle.stroke,
          strokeWidth: computedStyle.strokeWidth,
          backgroundColor: computedStyle.backgroundColor
        };
        
        originalStyles!.elements.push(el as HTMLElement);
        originalStyles!.styles.push(originalStyle);
        
        // Apply wireframe style
        (el as HTMLElement).style.fill = 'none';
        (el as HTMLElement).style.stroke = 'black';
        (el as HTMLElement).style.strokeWidth = '1px';
      });
      
      // Set background to white if it exists
      const svgElement = chartRef.querySelector('svg');
      if (svgElement) {
        (svgElement as SVGSVGElement).style.backgroundColor = 'white';
      }
    }
    
    // Set chart background style temporarily if asOutlines is true
    let originalBackgroundColor = '';
    if (asOutlines || wireframeStyle) {
      originalBackgroundColor = chartRef.style.backgroundColor;
      chartRef.style.backgroundColor = 'white';
    }
    
    // Capture the chart as canvas
    const canvas = await html2canvas(chartRef, {
      backgroundColor: (asOutlines || wireframeStyle) ? '#FFFFFF' : 'transparent',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
    });
    
    // Restore original styles if wireframe was applied
    if (wireframeStyle && originalStyles) {
      originalStyles.elements.forEach((el, index) => {
        const style = originalStyles!.styles[index];
        Object.keys(style).forEach(key => {
          el.style[key as any] = style[key as keyof typeof style];
        });
      });
    }
    
    // Restore original background if it was changed
    if ((asOutlines || wireframeStyle) && originalBackgroundColor !== '') {
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
  asOutlines: boolean,
  wireframeStyle?: boolean
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
      if (asOutlines || wireframeStyle) {
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

    // Apply wireframe styling if requested
    let originalStyles: {elements: HTMLElement[], styles: {[key: string]: string}[]} | null = null;
    
    if (wireframeStyle) {
      // Store original styles to restore later
      originalStyles = {elements: [], styles: []};
      
      // Select all SVG elements in the chart
      const svgElements = chartRef.querySelectorAll('svg *');
      
      // Apply wireframe styling to each element
      svgElements.forEach((el: Element) => {
        const computedStyle = window.getComputedStyle(el as HTMLElement);
        const originalStyle = {
          fill: computedStyle.fill,
          stroke: computedStyle.stroke,
          strokeWidth: computedStyle.strokeWidth,
          backgroundColor: computedStyle.backgroundColor
        };
        
        originalStyles!.elements.push(el as HTMLElement);
        originalStyles!.styles.push(originalStyle);
        
        // Apply wireframe style
        (el as HTMLElement).style.fill = 'none';
        (el as HTMLElement).style.stroke = 'black';
        (el as HTMLElement).style.strokeWidth = '1px';
      });
      
      // Set background to white if it exists
      const svgElement = chartRef.querySelector('svg');
      if (svgElement) {
        (svgElement as SVGSVGElement).style.backgroundColor = 'white';
      }
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
    if (asOutlines || wireframeStyle) {
      svgClone.setAttribute('style', 'background-color: white;');
      const paths = svgClone.querySelectorAll('path, line, rect, circle');
      paths.forEach(path => {
        path.setAttribute('stroke', 'black');
        path.setAttribute('fill', 'none');
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
    
    // Restore original styles if wireframe was applied
    if (wireframeStyle && originalStyles) {
      originalStyles.elements.forEach((el, index) => {
        const style = originalStyles!.styles[index];
        Object.keys(style).forEach(key => {
          el.style[key as any] = style[key as keyof typeof style];
        });
      });
    }
  } catch (error) {
    console.error('Error downloading chart as SVG:', error);
  }
};

// Main download function
export const downloadChart = async (
  chartRef: HTMLDivElement | React.RefObject<HTMLDivElement>,
  fileName: string,
  fileType: 'png' | 'jpg' | 'svg',
  asOutlines: boolean,
  wireframeStyle?: boolean
): Promise<void> => {
  // Handle both RefObject and direct HTMLDivElement
  const element = chartRef instanceof HTMLDivElement ? chartRef : chartRef.current;
  
  if (!element || !fileName.trim()) {
    console.error('Cannot download chart: Invalid chart reference or filename');
    return;
  }
  
  try {
    if (fileType === 'svg') {
      await downloadChartAsSVG(element, fileName.trim(), asOutlines, wireframeStyle);
    } else {
      await downloadChartAsImage(element, fileName.trim(), fileType, asOutlines, wireframeStyle);
    }
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
}; 