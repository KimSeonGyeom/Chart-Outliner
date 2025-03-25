"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ReactDOMServer from 'react-dom/server';
import { useDataStore } from '../store/dataStore';
import { useSharedStore } from '../store/sharedStore';
import { useChartStore } from '../store/chartStore';

const LineChart = () => {
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
  
  // Get chart-specific settings
  const curveType = useChartStore((state) => state.curveType);
  const curveTension = useChartStore((state) => state.curveTension);
  const showPoints = useChartStore((state) => state.showPoints);
  const pointRadius = useChartStore((state) => state.pointRadius);
  const pointShape = useChartStore((state) => state.pointShape);
  const lineStrokePattern = useChartStore((state) => state.lineStrokePattern);
  const lineStrokeWidth = useChartStore((state) => state.lineStrokeWidth);
  const lineDashArray = useChartStore((state) => state.lineDashArray);
  const lineColor = useChartStore((state) => state.lineColor);
  const pointStroke = useChartStore((state) => state.pointStroke);
  const pointStrokeWidth = useChartStore((state) => state.pointStrokeWidth);
  
  // Other state
  const svgRef = useRef(null);
  const chartRef = useRef(null);

  // Calculate the stroke-dasharray value based on the pattern
  const getStrokeDashArray = (pattern) => {
    if (pattern === 'custom') {
      return lineDashArray;
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
    if (pattern === 'solid') return color;
    return `url(#${pattern}Pattern)`;
  };

  // Helper function to create SVG path for custom shapes
  const createPointShape = (shape, x, y, radius) => {
    switch (shape) {
      case 'square':
        return `M${x - radius},${y - radius} h${radius * 2} v${radius * 2} h${-radius * 2} z`;
      case 'triangle':
        return `M${x},${y - radius} L${x + radius * 0.866},${y + radius * 0.5} L${x - radius * 0.866},${y + radius * 0.5} z`;
      case 'diamond':
        return `M${x},${y - radius} L${x + radius},${y} L${x},${y + radius} L${x - radius},${y} z`;
      case 'cross':
        const crossWidth = radius * 0.3;
        return `M${x - radius},${y - crossWidth} h${radius - crossWidth} v${-radius + crossWidth} h${crossWidth * 2} v${radius - crossWidth} h${radius - crossWidth} v${crossWidth * 2} h${-radius + crossWidth} v${radius - crossWidth} h${-crossWidth * 2} v${-radius + crossWidth} z`;
      case 'star':
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        let path = `M${x},${y - outerRadius} `;
        
        for (let i = 0; i < 5; i++) {
          const outerAngle = Math.PI / 2 + i * Math.PI * 2 / 5;
          const innerAngle = outerAngle + Math.PI / 5;
          
          const outerX = x + Math.cos(outerAngle) * outerRadius;
          const outerY = y - Math.sin(outerAngle) * outerRadius;
          const innerX = x + Math.cos(innerAngle) * innerRadius;
          const innerY = y - Math.sin(innerAngle) * innerRadius;
          
          path += `L${innerX},${innerY} L`;
          
          if (i === 4) {
            path += `${x},${y - outerRadius}`;
          } else {
            const nextOuterAngle = Math.PI / 2 + (i + 1) * Math.PI * 2 / 5;
            const nextOuterX = x + Math.cos(nextOuterAngle) * outerRadius;
            const nextOuterY = y - Math.sin(nextOuterAngle) * outerRadius;
            path += `${nextOuterX},${nextOuterY} `;
          }
        }
        
        return path;
      case 'circle':
      default:
        return null; // Use circle element for circles
    }
  };

  // Update chart with new data
  useEffect(() => {
    if (!svgRef.current || !chartData || chartData.length === 0) return;

    // Get the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add defs for patterns and filters
    const defs = svg.append('defs');
    
    // Add pattern for fill
    if (fill && fillPattern !== 'solid') {
      const pattern = createFillPattern(fillPattern, lineColor);
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }

    // Calculate inner dimensions
    const innerWidth = chartWidth;
    const innerHeight = chartHeight;

    // Create scales
    const x = d3.scalePoint()
      .domain(chartData.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);

    const yMin = yDomainMin !== undefined ? yDomainMin : d3.min(chartData, d => d.y) || 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(chartData, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([Math.min(0, yMin), yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Create main chart group
    const g = svg.append('g');

    // Create line generator with specified curve
    const getCurveFunction = (type) => {
      switch (type) {
        case 'cardinal':
          return d3.curveCardinal.tension(curveTension);
        case 'basis':
          return d3.curveBasis;
        case 'natural':
          return d3.curveNatural;
        case 'monotone':
          return d3.curveMonotoneX;
        case 'catmullRom':
          return d3.curveCatmullRom.alpha(curveTension);
        case 'linear':
        default:
          return d3.curveLinear;
      }
    };

    const line = d3.line()
      .x(d => x(String(d.x)) || 0)
      .y(d => y(d.y))
      .curve(getCurveFunction(curveType));

    // Add area if fill is enabled
    if (fill) {
      const area = d3.area()
        .x(d => x(String(d.x)) || 0)
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(getCurveFunction(curveType));

      g.append('path')
        .datum(chartData)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', getFillValue(fillPattern, lineColor))
        .attr('fill-opacity', fillOpacity);
    }

    // Add line with updated stroke properties
    g.append('path')
      .datum(chartData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', lineStrokeWidth > 0 ? lineColor : 'none')
      .attr('stroke-width', lineStrokeWidth)
      .attr('stroke-dasharray', lineStrokeWidth > 0 ? getStrokeDashArray(lineStrokePattern) : 'none');

    // Add points if enabled
    if (showPoints && pointRadius > 0) {
      // Store the data points for external use
      const pointsData = chartData.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || lineColor
      }));
      setDataPoints(pointsData);

      if (pointShape === 'circle') {
        // Use circles for circle shapes
        g.selectAll('.point')
          .data(chartData)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('cx', d => x(String(d.x)) || 0)
          .attr('cy', d => y(d.y))
          .attr('r', pointRadius)
          .attr('fill', d => d.color || lineColor)
          .attr('stroke', pointStroke)
          .attr('stroke-width', pointStrokeWidth);
      } else {
        // Use SVG paths for other shapes
        g.selectAll('.point')
          .data(chartData)
          .enter()
          .append('path')
          .attr('class', 'point')
          .attr('d', d => {
            const pointX = x(String(d.x)) || 0;
            const pointY = y(d.y);
            return createPointShape(pointShape, pointX, pointY, pointRadius);
          })
          .attr('fill', d => d.color || lineColor)
          .attr('stroke', pointStroke)
          .attr('stroke-width', pointStrokeWidth);
      }
    } else if (showPoints) {
      // Just store data points for external use without rendering them
      const pointsData = chartData.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || lineColor
      }));
      setDataPoints(pointsData);
    }

    // Add axes if enabled
    if (showXAxis) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));
    }

    if (showYAxis) {
      g.append('g')
        .call(d3.axisLeft(y));
    }

    // Store chart references
    chartRef.current = { g, x, y };

  }, [chartData, chartWidth, chartHeight, 
      curveType, curveTension, lineColor, fill, fillOpacity, fillPattern,
      showPoints, pointRadius, pointShape, pointStroke, pointStrokeWidth, lineStrokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax, lineStrokeWidth, lineDashArray, fillZoomLevel]);
  
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
          {/* Chart will be rendered here by D3 */}
        </svg>
      </div>
    </div>
  );
};

export default LineChart; 