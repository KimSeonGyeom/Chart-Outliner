"use client";

import React, { useEffect } from 'react';
import Papa from 'papaparse';
import { useAnalysisStore } from './store/analysisStore';
import './AnalysisPage.scss';

const AnalysisPage = () => {
  // Get state from the analysis store
  const { 
    data, 
    loading, 
    analysisData, 
    analysisLoading, 
    activeTab, 
    selectedVariable,
    variables,
    metrics,
    getVariableDisplay,
    getMetricDisplay,
    setData,
    setAnalysisData,
    setActiveTab,
    setSelectedVariable
  } = useAnalysisStore();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Papa Parse to fetch and parse CSV directly
        const response = await fetch('/api/csv-data?format=raw');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true, // Automatically convert strings to numbers
          complete: (results) => {
            setData(results.data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setData([]);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
    };

    const fetchAnalysisData = async () => {
      try {
        const response = await fetch('/api/analysis-data');
        const analysisResult = await response.json();
        setAnalysisData(analysisResult);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        setAnalysisData(null);
      }
    };

    fetchData();
    fetchAnalysisData();
  }, [setData, setAnalysisData]);
  
  return (
    <div className="analysis-container">
      <h1 className="analysis-title">Analysis Dashboard</h1>
      
      {/* Tab navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          Data Table
        </button>
        <button 
          className={`tab-button ${activeTab === 'visualization' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          Visualizations
        </button>
      </div>
      
      {/* Data Table Tab */}
      {activeTab === 'table' && (
        <div className="data-table">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <table className="data-table-content">
              <thead>
                <tr>
                  {data.length > 0 && Object.keys(data[0]).map((header, index) => (
                    <th key={index}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Analysis Visualization Tab */}
      {activeTab === 'visualization' && (
        <div className="visualization-container">
          {analysisLoading ? (
            <p>Loading analysis data...</p>
          ) : (
            <>
              {/* Control panel for selecting variables */}
              <div className="control-panel">
                <div className="form-group">
                  <div className="form-control">
                    <label className="form-label">
                      Select Variable to Analyze:
                    </label>
                    <select
                      value={selectedVariable}
                      onChange={(e) => setSelectedVariable(e.target.value)}
                      className="form-select"
                    >
                      {variables.map((variable) => (
                        <option key={variable.id} value={variable.id}>
                          {variable.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Four-column grid showing each metric */}
              <div className="metrics-grid">
                {metrics.map(metric => (
                  <div key={metric.id} className="metric-card">
                    <h3 className="metric-title" style={{ color: metric.color }}>
                      {metric.label}
                    </h3>
                    <div id={`chart-${metric.id}`} className="chart-container"></div>
                  </div>
                ))}
              </div>
              
              {/* Statistical significance panel */}
              <div className="stats-panel">
                <h2 className="stats-title">Statistical Significance for {getVariableDisplay(selectedVariable)}</h2>
                <div className="stats-grid">
                  {analysisData && analysisData.statistical_tests && 
                    metrics.map(metric => {
                      const testKey = `${selectedVariable}_${metric.id}`;
                      const test = analysisData.statistical_tests[testKey];
                      
                      if (!test) return null;
                      
                      return (
                        <div 
                          key={testKey} 
                          className={`stat-card ${test.p_value < 0.05 ? 'significant' : 'not-significant'}`}
                          style={{ borderLeft: `4px solid ${metric.color}` }}
                        >
                          <p className="stat-title">{metric.label}</p>
                          <p className="stat-value">p-value: {test.p_value.toFixed(4)}</p>
                          <p className="stat-value">
                            {test.p_value < 0.05 ? 'Statistically Significant' : 'Not Significant'}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPage; 