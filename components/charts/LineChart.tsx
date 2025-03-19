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
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  template: Template,
  fill = false,
  fillOpacity = 0.4
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dataPoints, setDataPoints] = useState<Array<{x: number, y: number, color: string}>>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Create inner chart area
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);
    
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
    
    // If fill is true, create and add area
    if (fill) {
      // Create area generator
      const area = d3.area<any>()
        .x(d => x(String(d.x)) || 0)
        .y0(innerHeight)
        .y1(d => y(d.y));
      
      // Add the area path
      g.append('path')
        .datum(data)
        .attr('fill', 'steelblue')
        .attr('fill-opacity', fillOpacity)
        .attr('stroke', 'none')
        .attr('d', area);
    }
    
    // Create line for both filled and unfilled versions
    const line = d3.line<any>()
      .x(d => x(String(d.x)) || 0)
      .y(d => y(d.y));
    
    // Add the line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
    
    // If no custom template, add circles for each data point
    if (!Template) {
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(String(d.x)) || 0)
        .attr('cy', d => y(d.y))
        .attr('r', 5)
        .attr('fill', d => d.color || 'steelblue');
    } else {
      // If custom template, prepare data points for rendering with the template component
      const points = data.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || 'steelblue'
      }));
      setDataPoints(points);
    }
    
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, Template, fill, fillOpacity]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      {/* Chart will be rendered here by D3 */}
      
      {/* If we have a template, render it for each data point */}
      {Template && dataPoints.map((point, i) => (
        <g key={i} transform={`translate(${marginLeft + point.x}, ${marginTop + point.y})`}>
          <Template
            x={0}
            y={0}
            width={10}
            height={10}
            color={point.color}
          />
        </g>
      ))}
    </svg>
  );
};

export default LineChart; 