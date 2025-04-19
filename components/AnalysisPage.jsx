"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from './store/uiStore';
import * as d3 from 'd3';

const AnalysisPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('table');
  
  const barChartRef = useRef(null);
  const correlationChartRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/csv-data');
      const csvData = await response.json();
      setData(csvData);
      setLoading(false);
    };

    const fetchAnalysisData = async () => {
      const response = await fetch('/api/analysis-data');
      const analysisResult = await response.json();
      setAnalysisData(analysisResult);
      setAnalysisLoading(false);
    };

    fetchData();
    fetchAnalysisData();
  }, []);
  
  useEffect(() => {
    if (analysisData && !analysisLoading && activeTab === 'visualization') {
      renderBarChart();
      renderCorrelationChart();
    }
  }, [analysisData, analysisLoading, activeTab]);
  
  const renderBarChart = () => {
    if (!analysisData || !barChartRef.current) return;
    
    // Clear previous chart
    d3.select(barChartRef.current).selectAll('*').remove();
    
    // Extract data for the chart (using CLIP scores by asset as example)
    const chartData = analysisData.descriptive_stats.asset.CLIP;
    
    // Set up dimensions
    const margin = {top: 30, right: 30, bottom: 70, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(barChartRef.current)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Average CLIP Score by Asset Type');
    
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.asset))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.mean) * 1.2])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll('mybar')
      .data(chartData)
      .enter()
      .append('rect')
        .attr('x', d => x(d.asset))
        .attr('y', d => y(d.mean))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.mean))
        .attr('fill', '#4f46e5')
        .attr('rx', 4)
        .attr('ry', 4);
    
    // Add error bars
    svg.selectAll('errorBar')
      .data(chartData)
      .enter()
      .append('line')
        .attr('x1', d => x(d.asset) + x.bandwidth()/2)
        .attr('x2', d => x(d.asset) + x.bandwidth()/2)
        .attr('y1', d => y(d.mean - d.std))
        .attr('y2', d => y(d.mean + d.std))
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);
  };
  
  const renderCorrelationChart = () => {
    if (!analysisData || !correlationChartRef.current) return;
    
    // Clear previous chart
    d3.select(correlationChartRef.current).selectAll('*').remove();
    
    // Extract correlation data
    const correlations = [];
    const metrics = ['CLIP', 'Lie_Factor', 'Match_count', 'Rank_Sim'];
    
    metrics.forEach(metric => {
      const key = `asset_size_${metric}`;
      if (analysisData.statistical_tests[key]) {
        correlations.push({
          metric,
          correlation: analysisData.statistical_tests[key].correlation,
          pValue: analysisData.statistical_tests[key].p_value
        });
      }
    });
    
    // Set up dimensions
    const margin = {top: 30, right: 30, bottom: 70, left: 120};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(correlationChartRef.current)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Correlation Between Asset Size and Metrics');
    
    // X axis
    const x = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, width]);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".1f")));
    
    // Y axis
    const y = d3.scaleBand()
      .range([0, height])
      .domain(correlations.map(d => d.metric))
      .padding(0.1);
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll('mybar')
      .data(correlations)
      .enter()
      .append('rect')
        .attr('x', d => d.correlation < 0 ? x(d.correlation) : x(0))
        .attr('y', d => y(d.metric))
        .attr('width', d => Math.abs(x(d.correlation) - x(0)))
        .attr('height', y.bandwidth())
        .attr('fill', d => d.pValue < 0.05 ? '#4f46e5' : '#94a3b8')
        .attr('rx', 4)
        .attr('ry', 4);
    
    // Add zero line
    svg.append('line')
      .attr('x1', x(0))
      .attr('x2', x(0))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4');
  };

  return (
    <div className="analysis-container p-6">
      <h1 className="text-2xl font-bold mb-4">Analysis Page</h1>
      
      {/* Tab navigation */}
      <div className="flex mb-4 border-b">
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === 'table' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('table')}
        >
          Data Table
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'visualization' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('visualization')}
        >
          Analysis Visualization
        </button>
      </div>
      
      {/* Data Table Tab */}
      {activeTab === 'table' && (
        <div>
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(data[0]).map((header, index) => (
                      <th key={index} className="py-2 px-4 border-b border-r text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-4 border-b border-r">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Analysis Visualization Tab */}
      {activeTab === 'visualization' && (
        <div>
          {analysisLoading ? (
            <p>Loading analysis data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Analysis Charts</h2>
                <div ref={barChartRef} className="w-full"></div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Correlations</h2>
                <div ref={correlationChartRef} className="w-full"></div>
              </div>
              
              <div className="bg-white p-4 rounded shadow md:col-span-2">
                <h2 className="text-lg font-semibold mb-2">Statistical Significance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysisData.statistical_tests).map(([key, test]) => (
                    <div key={key} className={`p-3 rounded ${test.p_value < 0.05 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <p className="font-medium">{key.replace('_', ' ')}</p>
                      <p>Test: {test.test}</p>
                      <p>p-value: {test.p_value.toFixed(4)}</p>
                      <p className="text-sm">
                        {test.p_value < 0.05 ? 'Statistically significant' : 'Not significant'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPage; 