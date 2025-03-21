"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChartData, TemplateProps } from '../templates/types';
import ReactDOMServer from 'react-dom/server';

interface BarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  barPadding?: number;
  barColor?: string;
  barStrokeColor?: string;
  barStrokeWidth?: number;
  barFill?: boolean;
  barFillOpacity?: number;
  barFillPattern?: string;
  barStrokePattern?: string;
  template?: React.ComponentType<TemplateProps> | null;
  
  // Axis appearance
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisTickCount?: number;
  yAxisTickCount?: number;
  
  // Domain customization
  yDomainMin?: number;
  yDomainMax?: number;
  
  // Optional callback for resize
  onResize?: (width: number, height: number) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 512,
  height = 512,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  barPadding = 0.2,
  barColor = 'transparent',
  barStrokeColor = '#000',
  barStrokeWidth = 1,
  barFill = false,
  barFillOpacity = 0.5,
  barFillPattern = 'solid',
  barStrokePattern = 'solid',
  template: Template,
  
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
  const [barData, setBarData] = useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
  }>>([]);
  
  // A key to force remounting templates when changed
  const [templateKey, setTemplateKey] = useState(0);
  
  // State for resize tracking
  const [isResizing, setIsResizing] = useState(false);
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({ width, height });

  // Effect to update template key when template changes
  useEffect(() => {
    setTemplateKey(prev => prev + 1);
  }, [Template]);

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
    if (!barFill) return 'transparent';
    if (pattern === 'solid') return color;
    return `url(#${pattern}Pattern)`;
  };

  // Update chart function to incorporate new features
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Add pattern definitions
    const defs = svg.append('defs');
    if (barFill && barFillPattern !== 'solid') {
      const pattern = createFillPattern(barFillPattern, barColor !== 'transparent' ? barColor : '#333');
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }
    
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    
    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(barPadding);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([
        yDomainMin !== undefined ? yDomainMin : 0,
        yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) as number * 1.1
      ])
      .nice()
      .range([innerHeight, 0]);
    
    // Create the chart group
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
    
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
    
    // Calculate bar data for reuse in templates
    const calcBarData = data.map((d, i) => {
      return {
        x: x(String(d.x)) ?? 0,
        y: y(d.y),
        width: x.bandwidth(),
        height: innerHeight - y(d.y),
        color: d.color || barColor,
        strokeColor: barStrokeColor,
        strokeWidth: barStrokeWidth
      };
    });
    
    setBarData(calcBarData);
    
    // Add bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(String(d.x)) ?? 0)
      .attr('y', d => y(d.y))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.y))
      .attr('fill', d => getFillValue(barFillPattern, d.color || barColor))
      .attr('fill-opacity', barFillOpacity)
      .attr('stroke', barStrokeColor)
      .attr('stroke-width', barStrokeWidth)
      .attr('stroke-dasharray', getStrokeDashArray(barStrokePattern));
    
    chartRef.current = { g, x, y };
    
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, 
      barPadding, barColor, barStrokeColor, barStrokeWidth, 
      barFill, barFillOpacity, barFillPattern, barStrokePattern,
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
          
          {/* If we have a template, render it for each bar */}
          {Template && barData.map((bar, i) => (
            <g 
              key={`template-${templateKey}-bar-${i}`} 
              transform={`translate(${marginLeft}, ${marginTop})`}
              className="template-bar"
            >
              <Template
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                color={bar.color}
                strokeColor={bar.strokeColor}
                strokeWidth={bar.strokeWidth}
              />
            </g>
          ))}
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

export default BarChart; 