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
  gridOpacity = 0.5
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [barData, setBarData] = useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
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
        .call(yAxis);
    }
    
    // If no custom template, render regular bars
    if (!Template) {
      g.selectAll('.bar')
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
    
  }, [
    data, width, height, marginTop, marginRight, marginBottom, marginLeft,
    barPadding, barColor, Template, showXAxis, showYAxis, xAxisTickCount,
    yAxisTickCount, yDomainMin, yDomainMax, showGrid, gridColor, gridOpacity
  ]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      {/* Chart will be rendered here by D3 */}
      
      {/* If we have a template, render it for each bar */}
      {Template && barData.map((bar, i) => (
        <g key={i} transform={`translate(${marginLeft}, ${marginTop})`}>
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
  );
};

export default BarChart; 