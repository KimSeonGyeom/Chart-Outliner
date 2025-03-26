"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ReactDOMServer from 'react-dom/server';
import { useDataStore } from '../store/dataStore';
import { useSharedStore } from '../store/sharedStore';
import { useChartStore } from '../store/chartStore';

const BarChart = () => {
  // Get data and settings from stores
  const chartData = useDataStore((state) => state.chartData);
  
  // Get shared settings
  const chartWidth = useSharedStore((state) => state.width);
  const chartHeight = useSharedStore((state) => state.height);
  const showXAxis = useSharedStore((state) => state.showXAxis);
  const showYAxis = useSharedStore((state) => state.showYAxis);
  const yDomainMin = useSharedStore((state) => state.yDomainMin);
  const yDomainMax = useSharedStore((state) => state.yDomainMax);
  const fill = useSharedStore((state) => state.fill);
  const fillPattern = useSharedStore((state) => state.fillPattern);
  const fillZoomLevel = useSharedStore((state) => state.fillZoomLevel);
  const fillOpacity = useSharedStore((state) => state.fillOpacity);
  const strokePattern = useSharedStore((state) => state.strokePattern);
  const strokeWidth = useSharedStore((state) => state.strokeWidth);
  const strokeColor = useSharedStore((state) => state.strokeColor);
  const strokeStyle = useSharedStore((state) => state.strokeStyle);
  const dashArray = useSharedStore((state) => state.dashArray);
  
  // Get chart-specific settings
  const barPadding = useChartStore((state) => state.barPadding);
  const barShape = useChartStore((state) => state.barShape);
  
  // Other state
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  
  // Define margins for axes
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  // Calculate the inner dimensions of the chart
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  // Calculate the stroke-dasharray value based on the pattern
  const getStrokeDashArray = (pattern) => {
    if (pattern === 'custom') {
      return dashArray;
    }
    
    switch (pattern) {
      case 'dashed':
        return '6,4';
      case 'dotted':
        return '2,2';
      case 'dash-dot':
        return '8,3,2,3';
      case 'long-dash':
        return '12,6';
      default:
        return 'none';
    }
  };

  // Create pattern definitions for fill patterns
  const createFillPattern = (pattern, color) => {
    // Size based on the zoom level (ensure it's at least 1px)
    const size = Math.max(1, fillZoomLevel);

    switch (pattern) {
      case 'diagonal':
        return (
          <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M-1,1 l2,-2 M0,${size} l${size},-${size} M${size-1},${size+1} l1,-1`} stroke={color} strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'crosshatch':
        return (
          <pattern id="crosshatchPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 l${size},${size} M${size},0 l-${size},${size}`} stroke={color} strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'dots':
        const radius = Math.max(0.5, size/5);
        return (
          <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <circle cx={size/2} cy={size/2} r={radius} fill={color} />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id="gridPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 h${size} M0,${size} h${size} M0,0 v${size} M${size},0 v${size}`} stroke={color} strokeWidth={Math.max(0.5, size/12)} />
          </pattern>
        );
      case 'zigzag':
        return (
          <pattern id="zigzagPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,${size/2} l${size/2},-${size/2} l${size/2},${size/2}`} stroke={color} strokeWidth={Math.max(0.5, size/8)} fill="none" />
          </pattern>
        );
      default:
        return null;
    }
  };

  // Create a path for the bar shape
  const createBarShape = (x, y, width, height, shape) => {
    switch (shape) {
      case 'triangle':
        return `M ${x},${y+height} L ${x+width/2},${y} L ${x+width},${y+height} Z`;
      case 'diamond':
        return `M ${x+width/2},${y} L ${x+width},${y+height/2} L ${x+width/2},${y+height} L ${x},${y+height/2} Z`;
      case 'oval':
        // For oval, we'll use ellipse element instead, return null here
        return null;
      case 'trapezoid':
        const indent = width * 0.2;
        return `M ${x+indent},${y} L ${x+width-indent},${y} L ${x+width},${y+height} L ${x},${y+height} Z`;
      case 'rectangle':
      default:
        // For rectangle, we'll use rect element, return null here
        return null;
    }
  };

  // Update chart function to incorporate new features
  useEffect(() => {
    if (!svgRef.current || !chartData || chartData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Add pattern definitions
    const defs = svg.append('defs');
    
    // Add pattern for fill
    if (fill && fillPattern !== 'solid') {
      const fillColor = '#000'; // Define fillColor here
      const pattern = createFillPattern(fillPattern, fillColor);
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }
    
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
    
    // Add bars with different shapes
    if (barShape === 'rectangle') {
      // Default rectangle bars
      g.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(String(d.x)) ?? 0)
        .attr('y', d => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.y))
        .attr('fill', d => fill ? '#000' : 'transparent')
        .attr('stroke', strokeWidth > 0 ? strokeColor : 'none')
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', getStrokeDashArray(strokePattern))
        .attr('stroke-linecap', strokeStyle);
    } else if (barShape === 'oval') {
      // Oval/ellipse bars
      g.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('ellipse')
        .attr('class', 'bar')
        .attr('cx', d => (x(String(d.x)) ?? 0) + x.bandwidth() / 2)
        .attr('cy', d => y(d.y) + (innerHeight - y(d.y)) / 2)
        .attr('rx', x.bandwidth() / 2)
        .attr('ry', d => (innerHeight - y(d.y)) / 2)
        .attr('fill', d => fill ? '#000' : 'transparent')
        .attr('stroke', strokeWidth > 0 ? strokeColor : 'none')
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', getStrokeDashArray(strokePattern));
    } else {
      // Custom shape bars using paths
      g.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('path')
        .attr('class', 'bar')
        .attr('d', d => {
          const xPos = x(String(d.x)) ?? 0;
          const yPos = y(d.y);
          const barWidth = x.bandwidth();
          const barHeight = innerHeight - y(d.y);
          return createBarShape(xPos, yPos, barWidth, barHeight, barShape);
        })
        .attr('fill', d => fill ? '#000' : 'transparent')
        .attr('stroke', strokeWidth > 0 ? strokeColor : 'none')
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', getStrokeDashArray(strokePattern));
    }
    
  }, [chartData, chartWidth, chartHeight, 
      barPadding, barShape, fill, fillPattern, strokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax, dashArray, strokeWidth, fillZoomLevel, strokeColor, 
      innerWidth, innerHeight]);

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
    <div style={{ position: 'relative' }}>
      <div className="chart-wrapper" style={{ position: 'relative', width: chartWidth, height: chartHeight }}>
        <svg ref={svgRef} width={chartWidth} height={chartHeight}>
          {/* Chart will be rendered by D3 */}
        </svg>
      </div>
    </div>
  );
};

export default BarChart;