"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ChartData, TemplateProps } from '../templates/types';

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
  template?: React.ComponentType<TemplateProps> | null;
  
  // Axis appearance
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisTickCount?: number;
  yAxisTickCount?: number;
  
  // Domain customization
  yDomainMin?: number;
  yDomainMax?: number;
  
  // Grid lines
  showGrid?: boolean;
  gridColor?: string;
  gridOpacity?: number;
  
  // Optional callback for resize
  onResize?: (width: number, height: number) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  barPadding = 0.2,
  barColor = 'steelblue',
  template: Template,
  
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
  const [barData, setBarData] = useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
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

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Store the main group in the ref to be able to clean it up later
    if (chartRef.current) {
      // Clean up previous chart elements
      chartRef.current.remove();
    }
    
    // Create inner chart area
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(barPadding);
    
    // Set y domain with optional min/max values
    const yMin = yDomainMin !== undefined ? yDomainMin : 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);
    
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
    
    // Store the main group element for cleanup
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
        .attr('x1', d => (x(d) || 0) + x.bandwidth() / 2)
        .attr('x2', d => (x(d) || 0) + x.bandwidth() / 2)
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
    
    // If no custom template, render regular bars
    if (!Template) {
      g.append('g')
        .attr('class', 'bars')
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(String(d.x)) || 0)
        .attr('y', d => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.y))
        .attr('fill', d => d.color || barColor);
    } else {
      // If custom template, prepare data for the template component
      const bars = data.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        width: x.bandwidth(),
        height: innerHeight - y(d.y),
        color: d.color || barColor
      }));
      
      setBarData(bars);
    }
    
    // Cleanup function
    return () => {
      if (chartRef.current && !Template) {
        // Only remove D3 elements if we're not using a React template
        // to avoid the "Failed to execute 'removeChild' on 'Node'" error
        chartRef.current.selectAll('*').remove();
      }
    };
    
  }, [
    data, width, height, marginTop, marginRight, marginBottom, marginLeft,
    barPadding, barColor, Template, showXAxis, showYAxis, xAxisTickCount,
    yAxisTickCount, yDomainMin, yDomainMax, showGrid, gridColor, gridOpacity
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