"use client";

import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useAnalysisStore } from './store/analysisStore';
import './AnalysisPage.scss';

const AnalysisPage = () => {
  // Use the analysis store instead of local state
  const { 
    data, loading, analysisData, analysisLoading, 
    setData, setAnalysisData, setLoading, setAnalysisLoading,
    getMetricColor, getMetricDisplay, getVariableLabel
  } = useAnalysisStore();
  const metrics = useAnalysisStore(state => state.metrics);
  
  // Create refs for all charts
  const chartRefs = React.useRef({});

  // Define variables - for 6 rows, 4 columns layout
  const variables = ['data_trend', 'data_count', 'asset', 'canny', 'asset_size', 'cond_scale'];
  
  // Chart dimensions
  const chartWidth = 280;
  const chartHeight = 200;
  
  // Load data from the API
  useEffect(() => {
    // Load the aggregated analysis data from the API
    async function loadAnalysisData() {
      try {
        setAnalysisLoading(true);
        const response = await fetch('/api/analysis/aggregated-filtered');
        if (!response.ok) {
          throw new Error(`Failed to fetch analysis data: ${response.statusText}`);
        }
        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        console.error('Error loading analysis data:', err);
        setAnalysisData(null);
      } finally {
        setAnalysisLoading(false);
      }
    }
    
    // Only load if analysis data is null
    if (!analysisData) {
      loadAnalysisData();
    }
  }, [analysisData, setAnalysisData, setAnalysisLoading]);

  // Process data for each variable and metric
  const processData = (variable, metricId) => {
    console.log(analysisData);
    // If we have pre-aggregated analysis data from API, use it
    if (analysisData && analysisData[variable] && analysisData[variable][metricId]) {
      return analysisData[variable][metricId];
    }
    
    // Otherwise, fall back to manual processing using CSV data
    if (!data.length) return null;
    
    // Group data by the variable
    const groupedData = d3.group(data, d => d[variable]);
    
    // Calculate average for each group
    const averagedData = Array.from(groupedData, ([key, values]) => {
      const avg = d3.mean(values, d => {
        const value = parseFloat(d[metricId]);
        // Handle Infinity values
        return isFinite(value) ? value : 0;
      });
      
      return { 
        category: key, 
        value: isNaN(avg) ? 0 : avg
      };
    });
    
    return averagedData;
  };

  // Effect to render all charts once data is loaded
  useEffect(() => {
    // Loop through all variables and metrics and render charts
    variables.forEach(variable => {
      metrics.forEach(metric => {
        const metricId = (metric.id=='Match_count') ? variable+'_'+metric.id : metric.id;
        console.log(metricId);
        const chartData = processData(variable, metricId);
        const chartKey = `${variable}-${metricId}`;
        const svgRef = chartRefs.current[chartKey];
        
        if (svgRef && chartData) {
          const svg = d3.select(svgRef);
          svg.selectAll('*').remove();
          
          // Set margins
          const margin = { top: 30, right: 10, bottom: 50, left: 40 };
          const width = chartWidth - margin.left - margin.right;
          const height = chartHeight - margin.top - margin.bottom;
          
          // Create chart area
          const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
          
          // Create scales
          const x = d3.scaleBand()
            .domain(chartData.map(d => d.category))
            .range([0, width])
            .padding(0.2);
          
          const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) * 1.1 || 1])
            .range([height, 0]);
          
          // Add x axis
          g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '8px');
          
          // Add y axis
          g.append('g')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('font-size', '8px');
          
          // Add bars
          g.selectAll('.bar')
            .data(chartData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.category))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', getMetricColor(metricId));
          
          // Add value labels on top of bars
          g.selectAll('.value-label')
            .data(chartData)
            .enter().append('text')
            .attr('class', 'value-label')
            .attr('x', d => x(d.category) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '8px')
            .text(d => d.value.toFixed(2));
          
          // Add chart title
          svg.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .text(`${getVariableLabel(variable)}`);
        }
      });
    });
  }, [data, analysisData, metrics]);

  // Render a single chart
  const renderChart = (variable, metricId) => {
    const chartData = processData(variable, metricId);
    if (!chartData) return <div className="chart-placeholder">Loading...</div>;
    
    const chartKey = `${variable}-${metricId}`;
    
    return (
      <div className="chart-container">
        <svg 
          ref={el => chartRefs.current[chartKey] = el} 
          width={chartWidth} 
          height={chartHeight}
        ></svg>
      </div>
    );
  };
  
  // Only show loading if both API and CSV methods are loading
  if (analysisLoading && loading) return <div className="loading">Loading analysis data...</div>;
  
  // Map metric objects to their IDs for rendering
  const metricIds = metrics.map(metric => metric.id);
  
  // Create a grid of 4 columns x 6 rows (24 charts total)
  // Each row represents a variable, each column represents a metric
  return (
    <div className="analysis-page">
      <h1>Data Analysis</h1>
      
      <div className="chart-grid">
        {/* Column headers - 4 columns for metrics */}
        <div className="grid-header">
          <div className="header-spacer"></div>
          {metricIds.map(metricId => (
            <div key={metricId} className="column-header" style={{ color: getMetricColor(metricId) }}>
              {getMetricDisplay(metricId)}
            </div>
          ))}
        </div>
        
        {/* 6 rows for variables */}
        {variables.map(variable => (
          <div key={variable} className="chart-row">
            <div className="row-label">
              {getVariableLabel(variable)}
            </div>
            <div className="row-charts">
              {metricIds.map(metricId => (
                <div key={`${variable}-${metricId}`} className="chart-cell">
                  {renderChart(variable, metricId)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPage;
