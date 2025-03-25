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
  const selectedTemplate = useChartStore((state) => state.selectedTemplate);
  
  // Other state
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  
  // Calculate the stroke-dasharray value based on the pattern
  const getStrokeDashArray = (pattern) => {
    if (pattern === 'custom') {
      return barDashArray;
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

  // Helper function to get fill value based on pattern
  const getFillValue = (pattern, color) => {
    if (!fill) return 'transparent';
    // If color is 'transparent' and we want a fill, use a default color
    const fillColor = color === 'transparent' ? '#000' : color;
    if (pattern === 'solid') return fillColor;
    return `url(#${pattern}Pattern)`;
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
      const pattern = createFillPattern(fillPattern, barColor !== 'transparent' ? barColor : '#333');
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }
    
    // X scale
    const x = d3.scaleBand()
      .domain(chartData.map(d => String(d.x)))
      .range([0, chartWidth])
      .padding(barPadding);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([
        yDomainMin !== undefined ? yDomainMin : 0,
        yDomainMax !== undefined ? yDomainMax : d3.max(chartData, d => d.y) * 1.1
      ])
      .nice()
      .range([chartHeight, 0]);
    
    // Create the chart group
    const g = svg.append('g');
    
    // Add axes if enabled
    if (showXAxis) {
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'middle');
    }
    
    if (showYAxis) {
      g.append('g')
        .call(d3.axisLeft(y));
    }
    
    // Add bars with updated stroke style
    const bars = g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(String(d.x)) ?? 0)
      .attr('y', d => y(d.y))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.y))
      .attr('fill', d => getFillValue(fillPattern, d.color || 'transparent'))
      .attr('stroke', strokeWidth > 0 ? strokeColor : 'none')
      .attr('stroke-width', strokeWidth)
      .attr('stroke-dasharray', getStrokeDashArray(strokePattern));
    
    chartRef.current = { g, x, y };
    
  }, [chartData, chartWidth, chartHeight, 
      barPadding, fill, fillPattern, strokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax, dashArray, strokeWidth, fillZoomLevel, strokeColor]);

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
          {chartData.map((bar, i) => {
            return (
              <g 
                key={`template-bar-${i}`} 
                className="template-bar"
              >
                <selectedTemplate
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  color={bar.color}
                  strokeColor={bar.strokeColor}
                  strokeWidth={bar.strokeWidth}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default BarChart;