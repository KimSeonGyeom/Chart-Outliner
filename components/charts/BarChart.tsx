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
  template?: React.ComponentType<TemplateProps> | null;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  template: Template,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [barPositions, setBarPositions] = useState<Array<{x: number, y: number, width: number, height: number, color: string}>>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Create inner chart area
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    
    const x = d3.scaleBand()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 0])
      .nice()
      .range([innerHeight, 0]);
    
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
    
    // Add x axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    // Add y axis
    g.append('g')
      .call(d3.axisLeft(y));
    
    // Add bars
    const barGroups = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', d => {
        const xPosition = x(String(d.x));
        return `translate(${xPosition || 0},0)`;
      });
    
    // If no custom template is provided, use default rectangles
    if (!Template) {
      barGroups.append('rect')
        .attr('y', d => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.y))
        .attr('fill', d => d.color || 'steelblue');
    } else {
      // If custom template, prepare bar positions for rendering with the template component
      const positions = data.map(d => {
        const xPosition = x(String(d.x)) || 0;
        const barWidth = x.bandwidth();
        const barHeight = innerHeight - y(d.y);
        const yPosition = y(d.y);
        
        return {
          x: xPosition,
          y: yPosition,
          width: barWidth,
          height: barHeight,
          color: d.color || 'steelblue'
        };
      });
      
      setBarPositions(positions);
    }
    
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, Template]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      {/* Chart will be rendered here by D3 */}
      
      {/* If we have a template, render it for each bar */}
      {Template && barPositions.map((bar, i) => (
        <g key={i} transform={`translate(${marginLeft + bar.x}, ${marginTop + bar.y})`}>
          <Template
            x={0}
            y={0}
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