"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useDataStore } from './store/dataStore';
import { useChartStore } from './store/chartStore';
import { useAiStore } from './store/aiStore';

const BarChart = () => {
  // Get data and settings from stores
  const chartData = useDataStore((state) => state.chartData.data);
  const subject = useDataStore((state) => state.chartData.subject);
  
  // Get shared settings
  const chartWidth = useChartStore((state) => state.width);
  const chartHeight = useChartStore((state) => state.height);
  const showXAxis = useChartStore((state) => state.showXAxis);
  const showYAxis = useChartStore((state) => state.showYAxis);
  const yDomainMin = useChartStore((state) => state.yDomainMin);
  const yDomainMax = useChartStore((state) => state.yDomainMax);
  
  // Get chart-specific settings
  const barPadding = useChartStore((state) => state.barPadding);
  
  // Get edge image data from aiStore - prioritize selected edge image if available
  const edgeImageData = useAiStore((state) => state.edgeImageData);
  const selectedEdgeImageData = useAiStore((state) => state.selectedEdgeImageData);
  
  // Other state
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  
  // Define margins for axes
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  // Calculate the inner dimensions of the chart
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;


  // Update chart function to incorporate new features
  useEffect(() => {
    if (!svgRef.current || !chartData || chartData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
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
    
    // Create a chart group for bars that will have transformations applied
    const barsGroup = g.append('g').attr('class', 'bars-group');
    
    // Only use edge image pattern if specifically selected by user
    const patternImageData = selectedEdgeImageData;
    
    if (patternImageData) {
      // Add bars with the edge image pattern
      // First, define a pattern for the edge image
      const defs = svg.append('defs');
      defs.append('pattern')
        .attr('id', 'edgeImagePattern')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 100)
        .attr('height', 100)
        .append('image')
        .attr('xlink:href', `data:image/png;base64,${patternImageData}`)
        .attr('width', 100)
        .attr('height', 100)
        .attr('preserveAspectRatio', 'none');
      
      // Add rectangle bars with the pattern fill
      barsGroup.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(String(d.x)) ?? 0)
        .attr('y', d => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.y))
        .attr('fill', 'url(#edgeImagePattern)')
        .attr('stroke', "black")
        .attr('stroke-width', 1);
    } else {
      // Add basic rectangle bars with transparent fill
      barsGroup.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(String(d.x)) ?? 0)
        .attr('y', d => y(d.y))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.y))
        .attr('fill', 'transparent')
        .attr('stroke', "black")
        .attr('stroke-width', 1);
    }
    
  }, [chartData, chartWidth, chartHeight, barPadding, showXAxis, showYAxis, yDomainMin, yDomainMax, innerWidth, innerHeight, selectedEdgeImageData]);

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