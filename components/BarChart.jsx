"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { useDataStore } from './store/dataStore';
import { useChartStore } from './store/chartStore';
import { useAiStore } from './store/aiStore';

const BarChart = forwardRef((props, ref) => {
  // Get data and settings from stores
  const chartData = useDataStore((state) => state.chartData.data);
  
  // Get shared settings
  const chartWidth = useChartStore((state) => state.width);
  const chartHeight = useChartStore((state) => state.height);
  const showXAxis = useChartStore((state) => state.showXAxis);
  const showYAxis = useChartStore((state) => state.showYAxis);
  const yDomainMin = useChartStore((state) => state.yDomainMin);
  const yDomainMax = useChartStore((state) => state.yDomainMax);
  
  // Get chart-specific settings
  const barPadding = useChartStore((state) => state.barPadding);
  const topEdgeImageWidthScale = useChartStore((state) => state.topEdgeImageWidthScale);
  
  // Get edge image data from aiStore - prioritize selected edge image if available
  const selectedEdgeImageData = useAiStore((state) => state.selectedEdgeImageData);
  const topEdgeImage = useAiStore((state) => state.top_edge_image);
  const bottomEdgeImage = useAiStore((state) => state.bottom_edge_image);
  
  // Other state
  const originalSvgRef = useRef(null);
  const cannyEdgeSvgRef = useRef(null);
  const chartRef = useRef(null);
  
  // Expose refs to parent component
  useImperativeHandle(ref, () => ({
    originalSvgRef,
    cannyEdgeSvgRef,
    chartContainer: chartRef
  }));
  
  // Define margins for axes
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  // Calculate the inner dimensions of the chart
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Function to create a basic bar chart with transparent bars
  const renderBasicBarChart = (svgRef) => {
    if (!svgRef.current || !chartData || chartData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Create the chart group with margin translation
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
      .domain(chartData.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(barPadding);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([
        yDomainMin !== undefined ? yDomainMin : 0,
        yDomainMax !== undefined ? yDomainMax : d3.max(chartData, d => d.y) * 1.1
      ])
      .nice()
      .range([innerHeight, 0]);
    
    // Add axes if enabled
    if (showXAxis) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'middle');
    }
    
    if (showYAxis) {
      g.append('g')
        .call(d3.axisLeft(y));
    }
    
    // Create a chart group for bars
    const barsGroup = g.append('g').attr('class', 'bars-group');
    
    // Add basic bars
    barsGroup.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(String(d.x)) ?? 0)
      .attr('y', d => {
        // For positive values (relative to yDomainMin), start from the value's Y coordinate
        return y(Math.max(d.y, yDomainMin !== undefined ? yDomainMin : 0));
      })
      .attr('width', x.bandwidth())
      .attr('height', d => {
        // Calculate proper bar height 
        // The bar should start at the data point and end at the domain minimum
        return Math.abs(y(yDomainMin !== undefined ? yDomainMin : 0) - y(d.y));
      })
      .attr('fill', 'white')
      .attr('stroke', "black")
      .attr('stroke-width', 1);
    
    return { x, y, g };
  };
  
  // Function to create a bar chart with canny edge pattern
  const renderCannyEdgeBarChart = (svgRef) => {
    if (!svgRef.current || !chartData || chartData.length === 0 || !selectedEdgeImageData) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Create the chart group with margin translation
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Get edge image data from aiStore - removing contours reference
    const { top_edge_image, bottom_edge_image, edgeImageData_Processed, edgeImageData } = useAiStore.getState();
    
    // Determine if we're using a processed edge image or the standard one
    let topEdgeImageData = top_edge_image;
    let bottomEdgeImageData = bottom_edge_image;
    
    // Check if we're using a processed edge image and select appropriate top/bottom images
    if (selectedEdgeImageData !== edgeImageData) {
      // Determine which processed technique was selected
      for (const technique of ['sparsification', 'blur']) {
        if (edgeImageData_Processed[technique] === selectedEdgeImageData) {
          // Use the corresponding top/bottom images for this technique
          topEdgeImageData = edgeImageData_Processed[`${technique}_top`] || top_edge_image;
          bottomEdgeImageData = edgeImageData_Processed[`${technique}_bottom`] || bottom_edge_image;
          break;
        }
      }
    }
    
    // If top or bottom edge images aren't available, fall back to the selected edge image
    topEdgeImageData = topEdgeImageData || selectedEdgeImageData;
    bottomEdgeImageData = bottomEdgeImageData || selectedEdgeImageData;
    
    // Create images and wait for them to load before proceeding
    const loadImages = () => {
      return new Promise((resolve) => {
        const topImg = new Image();
        const bottomImg = new Image();
        let loadedCount = 0;
        
        const checkAllLoaded = () => {
          loadedCount++;
          if (loadedCount === 2) resolve({ topImg, bottomImg });
        };
        
        topImg.onload = checkAllLoaded;
        bottomImg.onload = checkAllLoaded;
        
        // Handle errors - still resolve but with default dimensions
        topImg.onerror = () => {
          console.error('Failed to load top edge image');
          checkAllLoaded();
        };
        
        bottomImg.onerror = () => {
          console.error('Failed to load bottom edge image');
          checkAllLoaded();
        };
        
        // Set source to trigger loading
        topImg.src = `data:image/png;base64,${topEdgeImageData}`;
        bottomImg.src = `data:image/png;base64,${bottomEdgeImageData}`;
      });
    };
    
    // Load images first, then continue with chart rendering
    loadImages().then(({ topImg, bottomImg }) => {
      const topImageWidth = topImg.width; // Fallback if width not available
      const topImageHeight = topImg.height; // Fallback if height not available
      
      const bottomImageWidth = bottomImg.width;
      const bottomImageHeight = bottomImg.height;
      
      // X scale
      const x = d3.scaleBand()
        .domain(chartData.map(d => String(d.x)))
        .range([0, innerWidth])
        .padding(barPadding);
      
      // Y scale with properly adjusted domain
      const y = d3.scaleLinear()
        .domain([
          yDomainMin !== undefined ? yDomainMin : 0,
          yDomainMax !== undefined ? yDomainMax : d3.max(chartData, d => d.y) * 1.1
        ])
        .nice()
        .range([innerHeight, 0]);
      
      // Add axes if enabled
      if (showXAxis) {
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .style('text-anchor', 'middle');
      }
      
      if (showYAxis) {
        g.append('g')
          .call(d3.axisLeft(y));
      }
      
      // Add asset images
      chartData.forEach((d, i) => {
        const barWidth = x.bandwidth();
        const barX = x(String(d.x)) ?? 0;
        const barY = y(d.y);
        
        // Create a group for the bar's edge images
        const imageGroup = g.append('g')
          .attr('class', 'edge-image-group');
        
        // Add the top edge image
        imageGroup.append('image')
          .attr('xlink:href', `data:image/png;base64,${topEdgeImageData}`)
          .attr('x', barX + (barWidth - topImageWidth * topEdgeImageWidthScale) / 2)
          .attr('y', barY) // Position exactly at the top of the bar
          .attr('height', topImageHeight) // Use actual image height
          .attr('preserveAspectRatio', 'xMidYMin meet') // Maintain aspect ratio, center the image
          .attr('width', topImageWidth * topEdgeImageWidthScale); // Scale width based on the adjustable scale

        // Add the bottom edge image
        imageGroup.append('image')
          .attr('xlink:href', `data:image/png;base64,${bottomEdgeImageData}`)
          .attr('x', barX + (barWidth - bottomImageWidth * topEdgeImageWidthScale) / 2)
          .attr('y', innerHeight - bottomImageHeight) // Position exactly at the bottom of the bar
          .attr('height', bottomImageHeight) // Use actual image height
          .attr('preserveAspectRatio', 'xMidYMax meet') // Maintain aspect ratio, center the image
          .attr('width', bottomImageWidth * topEdgeImageWidthScale); // Scale width based on the adjustable scale
      });
    });
  };

  // Update original chart
  useEffect(() => {
    renderBasicBarChart(originalSvgRef);
  }, [chartData, barPadding, showXAxis, showYAxis, yDomainMin, yDomainMax]);

  // Update canny edge chart whenever selectedEdgeImageData or top/bottom images change
  useEffect(() => {
    if (selectedEdgeImageData) {
      renderCannyEdgeBarChart(cannyEdgeSvgRef);
    } else {
      // Clear canny edge chart when no edge image is selected
      if (cannyEdgeSvgRef.current) {
        d3.select(cannyEdgeSvgRef.current).selectAll('*').remove();
      }
    }
  }, [selectedEdgeImageData, topEdgeImage, bottomEdgeImage, chartData, barPadding, showXAxis, showYAxis, yDomainMin, yDomainMax, topEdgeImageWidthScale]);
  
  // Effect to clean up when component unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.g) {
        // Clean up D3 elements but preserve the SVG container
        chartRef.current.g.selectAll('*').remove();
      }
    };
  }, []);

  return (
    <div className="chart-wrapper-container" style={{ position: 'relative' }} ref={chartRef}>
      <div className="chart-wrapper" style={{ position: 'relative', width: chartWidth, height: chartHeight }}>
        <svg ref={originalSvgRef} width={chartWidth} height={chartHeight}>
          {/* Original chart will be rendered by D3 */}
        </svg>
      </div>
      <div className="chart-wrapper" style={{ position: 'relative', width: chartWidth, height: chartHeight, display: selectedEdgeImageData ? 'block' : 'none' }}>
        <svg ref={cannyEdgeSvgRef} width={chartWidth} height={chartHeight} style={{ backgroundColor: 'black' }}>
          {/* Canny edge chart will be rendered by D3 */}
        </svg>
      </div>
    </div>
  );
});

export default BarChart;