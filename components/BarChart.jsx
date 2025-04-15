"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { useDataStore } from './store/dataStore';
import { useChartStore } from './store/chartStore';
import { useAiStore } from './store/aiStore';

const BarChart = forwardRef((props, ref) => {
  // Get data and settings from stores
  const chartData = useDataStore((state) => state.chartData.data);
  const subject = useDataStore((state) => state.chartData.subject);
  
  // Get shared settings
  const chartWidth = useChartStore((state) => state.width);
  const chartHeight = useChartStore((state) => state.height);
  const showXAxis = useChartStore((state) => state.showXAxis);
  const showYAxis = useChartStore((state) => state.showYAxis);
  const yDomainMin = useChartStore((state) => state.yDomainMin);
  const yDomainMax = useChartStore((state) => state.yDomainMax);
  
  // Get chart-specific settings
  const barPadding = useChartStore((state) => state.barPadding);
  
  // Get edge image data from aiStore - prioritize selected edge image if available
  const edgeImageData = useAiStore((state) => state.edgeImageData);
  const selectedEdgeImageData = useAiStore((state) => state.selectedEdgeImageData);
  
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
    
    // Add basic bars first
    barsGroup.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(String(d.x)) ?? 0)
      .attr('y', d => y(d.y))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.y))
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
      .attr('y', d => y(d.y))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.y))
      .attr('fill', 'black')
      .attr('stroke', "black")
      .attr('stroke-width', 1);
    
    // Define fixed height for the edge images at the top and bottom of each bar
    const edgeImageHeight = 40; // You can adjust this value as needed
    
    // Add edge images at the top and bottom of each bar
    chartData.forEach((d, i) => {
      const barWidth = x.bandwidth();
      const barX = x(String(d.x)) ?? 0;
      const barTopY = y(d.y);
      const barHeight = innerHeight - y(d.y);
      const barBottomY = innerHeight - Math.min(edgeImageHeight, barHeight);
      
      // Create a group for the bar's edge images
      const imageGroup = g.append('g')
        .attr('class', 'edge-image-group');
      
      // Add the edge image at the top with preserved aspect ratio
      imageGroup.append('image')
        .attr('class', 'top-edge-image')
        .attr('x', barX)
        .attr('y', barTopY)
        .attr('width', barWidth)
        .attr('height', Math.min(edgeImageHeight, barHeight))
        .attr('xlink:href', `data:image/png;base64,${selectedEdgeImageData}`)
        .attr('preserveAspectRatio', 'xMidYMin slice');
      
      // Add the edge image at the bottom with preserved aspect ratio
      imageGroup.append('image')
        .attr('class', 'bottom-edge-image')
        .attr('x', barX)
        .attr('y', barBottomY)
        .attr('width', barWidth)
        .attr('height', Math.min(edgeImageHeight, barHeight))
        .attr('xlink:href', `data:image/png;base64,${selectedEdgeImageData}`)
        .attr('preserveAspectRatio', 'xMidYMax slice'); // Position from bottom
    });
  };
  
  // Update original chart
  useEffect(() => {
    renderBasicBarChart(originalSvgRef);
  }, [chartData, chartWidth, chartHeight, barPadding, showXAxis, showYAxis, yDomainMin, yDomainMax, innerWidth, innerHeight]);

  // Update canny edge chart whenever selectedEdgeImageData changes
  useEffect(() => {
    if (selectedEdgeImageData) {
      renderCannyEdgeBarChart(cannyEdgeSvgRef);
    } else {
      // Clear canny edge chart when no edge image is selected
      if (cannyEdgeSvgRef.current) {
        d3.select(cannyEdgeSvgRef.current).selectAll('*').remove();
      }
    }
  }, [selectedEdgeImageData, chartData, chartWidth, chartHeight, barPadding, showXAxis, showYAxis, yDomainMin, yDomainMax, innerWidth, innerHeight]);
  
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

// Add display name for better debugging
BarChart.displayName = 'BarChart';

export default BarChart;