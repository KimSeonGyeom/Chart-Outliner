"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChartData, TemplateProps } from '../templates/types';

interface LineChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  template?: React.ComponentType<TemplateProps> | null;
  fill?: boolean; // Whether to fill the area under the line
  fillOpacity?: number; // Opacity of the fill color
  
  // Curve parameters
  curveType?: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension?: number; // Tension parameter for cardinal and catmullRom curves (0 to 1)
  
  // Line appearance
  lineColor?: string;
  lineWidth?: number;
  lineDash?: number[]; // For dashed lines [dashLength, gapLength]
  
  // Point appearance
  showPoints?: boolean; // Whether to show data points
  pointRadius?: number;
  pointStroke?: string;
  pointStrokeWidth?: number;
  
  // Axis appearance
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisTickCount?: number;
  yAxisTickCount?: number;
  
  // Domain customization
  yDomainMin?: number; // Override automatic y domain minimum
  yDomainMax?: number; // Override automatic y domain maximum
  
  // Grid lines
  showGrid?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  
  // Optional callback for resize
  onResize?: (width: number, height: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  // template: Template,
  fill = false,
  fillOpacity = 0.4,
  
  // Curve parameters
  curveType = 'cardinal',
  curveTension = 0.5,
  
  // Line appearance
  lineColor = 'steelblue',
  lineWidth = 1.5,
  lineDash,
  
  // Point appearance
  showPoints = true,
  pointRadius = 5,
  pointStroke,
  pointStrokeWidth = 1,
  
  // Axis appearance
  showXAxis = true,
  showYAxis = true,
  xAxisTickCount,
  yAxisTickCount,
  
  // Domain customization
  yDomainMin,
  yDomainMax,
  
  // Grid lines
  showGrid = false,
  gridColor = '#e0e0e0',
  gridOpacity = 0.5,
  
  // Resize callback
  onResize
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<any>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [dataPoints, setDataPoints] = useState<Array<{x: number, y: number, color: string}>>([]);
  
  // State for resize tracking
  const [isResizing, setIsResizing] = useState(false);
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({ width, height });

  // Setup resize event handlers
  useEffect(() => {
    if (!resizeHandleRef.current) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setStartResizePos({ x: e.clientX, y: e.clientY });
      setInitialDimensions({ width, height });
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const dx = e.clientX - startResizePos.x;
      const dy = e.clientY - startResizePos.y;
      
      // Update dimensions with minimum constraints
      const newWidth = Math.max(200, initialDimensions.width + dx);
      const newHeight = Math.max(150, initialDimensions.height + dy);
      
      // Notify parent component of resize
      if (onResize) {
        onResize(newWidth, newHeight);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    const handle = resizeHandleRef.current;
    handle.addEventListener('mousedown', handleMouseDown);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      handle.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startResizePos, initialDimensions, width, height, onResize]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear the previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
    }
    
    // Create inner chart area
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);
    
    // Set y domain with optional min/max values
    const yMin = yDomainMin !== undefined ? yDomainMin : 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);
    
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
      
    // Store the group for later cleanup
    chartRef.current = g;
    
    // Add grid lines if enabled
    if (showGrid) {
      // Add horizontal grid lines
      g.append('g')
        .attr('class', 'grid horizontal-grid')
        .selectAll('line')
        .data(y.ticks(yAxisTickCount))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridOpacity)
        .attr('stroke-dasharray', '3,3');
      
      // Add vertical grid lines for each x tick
      g.append('g')
        .attr('class', 'grid vertical-grid')
        .selectAll('line')
        .data(data.map(d => String(d.x)))
        .enter()
        .append('line')
        .attr('x1', d => x(d) || 0)
        .attr('x2', d => x(d) || 0)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridOpacity)
        .attr('stroke-dasharray', '3,3');
    }
    
    // Add x axis if enabled
    if (showXAxis) {
      const xAxis = d3.axisBottom(x);
      if (xAxisTickCount) {
        xAxis.tickValues(
          x.domain().filter((_, i, arr) => i % Math.ceil(arr.length / xAxisTickCount) === 0)
        );
      }
      
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);
    }
    
    // Add y axis if enabled
    if (showYAxis) {
      const yAxis = d3.axisLeft(y);
      if (yAxisTickCount) {
        yAxis.ticks(yAxisTickCount);
      }
      
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    }
    
    // Select curve function based on curveType
    let curveFunction;
    switch (curveType) {
      case 'basis':
        curveFunction = d3.curveBasis;
        break;
      case 'natural':
        curveFunction = d3.curveNatural;
        break;
      case 'monotone':
        curveFunction = d3.curveMonotoneX;
        break;
      case 'catmullRom':
        curveFunction = d3.curveCatmullRom.alpha(curveTension);
        break;
      case 'linear':
        curveFunction = d3.curveLinear;
        break;
      case 'cardinal':
      default:
        curveFunction = d3.curveCardinal.tension(curveTension);
        break;
    }
    
    // If fill is true, create and add area
    if (fill) {
      // Create area generator
      const area = d3.area<any>()
        .x(d => x(String(d.x)) || 0)
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(curveFunction); // Use selected curve type
      
      // Add the area path
      g.append('path')
        .datum(data)
        .attr('fill', lineColor)
        .attr('fill-opacity', fillOpacity)
        .attr('stroke', 'none')
        .attr('d', area);
    }
    
    // Create line for both filled and unfilled versions
    const line = d3.line<any>()
      .x(d => x(String(d.x)) || 0)
      .y(d => y(d.y))
      .curve(curveFunction); // Use selected curve type
    
    // Add the line path
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('d', line);
    
    // Add line dash if specified
    if (lineDash && lineDash.length > 0) {
      path.attr('stroke-dasharray', lineDash.join(','));
    }
    
    // If no custom template and showPoints is true, add circles for each data point
    if (showPoints) {
      const points = g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(String(d.x)) || 0)
        .attr('cy', d => y(d.y))
        .attr('r', pointRadius)
        .attr('fill', d => d.color || lineColor);
        
      // Add stroke to points if specified
      if (pointStroke) {
        points
          .attr('stroke', pointStroke)
          .attr('stroke-width', pointStrokeWidth);
      }
    }
    
    // Store data points for template rendering
    setDataPoints(data.map(d => ({
      x: x(String(d.x)) || 0,
      y: y(d.y),
      color: d.color || lineColor
    })));
    
    // Cleanup function
    return () => {
      // No cleanup needed as we'll handle it in the effect
    };
  }, [
    data, width, height, marginTop, marginRight, marginBottom, marginLeft,
    fill, fillOpacity, curveType, curveTension, lineColor, lineWidth, lineDash,
    showPoints, pointRadius, pointStroke, pointStrokeWidth,
    showXAxis, showYAxis, xAxisTickCount, yAxisTickCount,
    yDomainMin, yDomainMax, showGrid, gridColor, gridOpacity
  ]);
  
  // Effect to clean up when component unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);
  
  // Resize handle styles
  const resizeHandleStyle: React.CSSProperties = {
    cursor: 'nwse-resize',
    backgroundColor: '#ccc',
    opacity: isResizing ? 0.6 : 0.0,
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="chart-wrapper" style={{ position: 'relative', width: width, height: height }}>
        <svg ref={svgRef} width={width} height={height}>
          {/* Chart will be rendered here by D3 */}
        </svg>
      </div>
      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        style={resizeHandleStyle}
      />
    </div>
  );
};

export default LineChart; 