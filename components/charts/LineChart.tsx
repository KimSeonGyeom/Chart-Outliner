"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChartData, ChartDataPoint } from '../templates/types';
import ReactDOMServer from 'react-dom/server';

interface LineChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  fill?: boolean; // Whether to fill the area under the line
  fillOpacity?: number; // Opacity of the fill color
  fillPattern?: string; // Pattern to fill the area with
  
  // Curve parameters
  curveType?: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension?: number; // Tension parameter for cardinal and catmullRom curves (0 to 1)
  
  // Line appearance
  lineColor?: string;
  lineWidth?: number;
  lineDash?: number[]; // For dashed lines [dashLength, gapLength]
  lineStrokePattern?: string; // Added stroke pattern option
  
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
  
  // Optional callback for resize
  onResize?: (width: number, height: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 512,
  height = 512,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  fill = false,
  fillOpacity = 0.0,
  fillPattern = 'solid',
  
  // Curve parameters
  curveType = 'linear',
  curveTension = 0.5,
  
  // Line appearance
  lineColor = '#000',
  lineWidth = 1,
  lineDash,
  lineStrokePattern = 'solid',
  
  // Point appearance
  showPoints = true,
  pointRadius = 3,
  pointStroke = '#000',
  pointStrokeWidth = 1,
  
  // Axis appearance
  showXAxis = true,
  showYAxis = true,
  xAxisTickCount,
  yAxisTickCount,
  
  // Domain customization
  yDomainMin,
  yDomainMax,
  
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

  // Calculate the stroke-dasharray value based on the pattern
  const getStrokeDashArray = (pattern: string): string => {
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
  const createFillPattern = (pattern: string, color: string) => {
    switch (pattern) {
      case 'diagonal':
        return (
          <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l1,-1" stroke={color} strokeWidth="1" />
          </pattern>
        );
      case 'crosshatch':
        return (
          <pattern id="crosshatchPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0,0 l8,8 M8,0 l-8,8" stroke={color} strokeWidth="1" />
          </pattern>
        );
      case 'dots':
        return (
          <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <circle cx="4" cy="4" r="1.5" fill={color} />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id="gridPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0,0 h8 M0,8 h8 M0,0 v8 M8,0 v8" stroke={color} strokeWidth="1" />
          </pattern>
        );
      case 'zigzag':
        return (
          <pattern id="zigzagPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0,4 l4,-4 l4,4" stroke={color} strokeWidth="1" fill="none" />
          </pattern>
        );
      default:
        return null;
    }
  };

  // Helper function to get fill value based on pattern
  const getFillValue = (pattern: string, color: string) => {
    if (!fill) return 'transparent';
    if (pattern === 'solid') return color;
    return `url(#${pattern}Pattern)`;
  };

  // Update chart with new data
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Get the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add pattern definitions
    const defs = svg.append('defs');
    if (fill && fillPattern !== 'solid') {
      const pattern = createFillPattern(fillPattern, lineColor);
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }

    // Calculate inner dimensions
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);

    const yMin = yDomainMin !== undefined ? yDomainMin : d3.min(data, d => d.y) || 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([Math.min(0, yMin), yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Create line generator with specified curve
    const getCurveFunction = (type: string) => {
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

    const line = d3.line<ChartDataPoint>()
      .x(d => x(String(d.x)) || 0)
      .y(d => y(d.y))
      .curve(getCurveFunction(curveType));

    // Add area if fill is enabled
    if (fill) {
      const area = d3.area<ChartDataPoint>()
        .x(d => x(String(d.x)) || 0)
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(getCurveFunction(curveType));

      g.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', getFillValue(fillPattern, lineColor))
        .attr('fill-opacity', fillOpacity);
    }

    // Add line
    g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('stroke-dasharray', getStrokeDashArray(lineStrokePattern));

    // Add points if enabled
    if (showPoints) {
      // Store the data points for external use
      const pointsData = data.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || lineColor
      }));
      setDataPoints(pointsData);

      g.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(String(d.x)) || 0)
        .attr('cy', d => y(d.y))
        .attr('r', pointRadius)
        .attr('fill', d => d.color || lineColor)
        .attr('stroke', pointStroke)
        .attr('stroke-width', pointStrokeWidth);
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

  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, 
      curveType, curveTension, lineColor, lineWidth, fill, fillOpacity, fillPattern,
      showPoints, pointRadius, pointStroke, pointStrokeWidth, lineStrokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax]);
  
  // Effect to clean up when component unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.g) {
        // Clean up D3 elements but preserve the SVG container
        chartRef.current.g.selectAll('*').remove();
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