"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ReactDOMServer from 'react-dom/server';

const BarChart = ({
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
  barFillZoomLevel = 8,
  barStrokePattern = 'solid',
  barStrokeStyle = 'normal',
  barDashArray = '6,4',
  template,
  
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
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const [barData, setBarData] = useState([]);
  
  // A key to force remounting templates when changed
  const [templateKey, setTemplateKey] = useState(0);
  
  // State for resize tracking
  const [isResizing, setIsResizing] = useState(false);
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({ width, height });

  // Effect to update template key when template changes
  useEffect(() => {
    setTemplateKey(prev => prev + 1);
  }, [template]);

  // Setup resize event handlers
  useEffect(() => {
    if (!resizeHandleRef.current) return;
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      setIsResizing(true);
      setStartResizePos({ x: e.clientX, y: e.clientY });
      setInitialDimensions({ width, height });
    };
    
    const handleMouseMove = (e) => {
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
  const getStrokeDashArray = (pattern) => {
    if (pattern === 'custom') {
      return barDashArray;
    }
    
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
  const createFillPattern = (pattern, color) => {
    // Size based on the zoom level (ensure it's at least 1px)
    const size = Math.max(1, barFillZoomLevel);

    switch (pattern) {
      case 'diagonal':
        return (
          <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M-1,1 l2,-2 M0,${size} l${size},-${size} M${size-1},${size+1} l1,-1`} stroke={color} strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'crosshatch':
        return (
          <pattern id="crosshatchPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 l${size},${size} M${size},0 l-${size},${size}`} stroke={color} strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'dots':
        const radius = Math.max(0.5, size/5);
        return (
          <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <circle cx={size/2} cy={size/2} r={radius} fill={color} />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id="gridPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 h${size} M0,${size} h${size} M0,0 v${size} M${size},0 v${size}`} stroke={color} strokeWidth={Math.max(0.5, size/12)} />
          </pattern>
        );
      case 'zigzag':
        return (
          <pattern id="zigzagPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,${size/2} l${size/2},-${size/2} l${size/2},${size/2}`} stroke={color} strokeWidth={Math.max(0.5, size/8)} fill="none" />
          </pattern>
        );
      default:
        return null;
    }
  };

  // Helper function to get fill value based on pattern
  const getFillValue = (pattern, color) => {
    if (!barFill) return 'transparent';
    // If color is 'transparent' and we want a fill, use a default color
    const fillColor = color === 'transparent' ? '#000' : color;
    if (pattern === 'solid') return fillColor;
    return `url(#${pattern}Pattern)`;
  };

  // Create a filter for the brush stroke effect
  const createBrushStrokeEffect = (id) => {
    return (
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence baseFrequency="0.05" numOctaves="2" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="1.5" />
      </filter>
    );
  };
  
  // Create a filter for the sketch stroke effect
  const createSketchStrokeEffect = (id) => {
    return (
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence baseFrequency="0.01" numOctaves="3" seed="2" />
        <feDisplacementMap in="SourceGraphic" scale="2" />
      </filter>
    );
  };
  
  // Create a filter for the rough stroke effect
  const createRoughStrokeEffect = (id) => {
    return (
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence baseFrequency="0.08" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
    );
  };

  // Update chart function to incorporate new features
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Add pattern definitions
    const defs = svg.append('defs');
    
    // Add SVG filters for stroke styles
    if (barStrokeStyle === 'brush') {
      defs.html(ReactDOMServer.renderToString(createBrushStrokeEffect('brushEffect')));
    } else if (barStrokeStyle === 'sketch') {
      defs.html(ReactDOMServer.renderToString(createSketchStrokeEffect('sketchEffect')));
    } else if (barStrokeStyle === 'rough') {
      defs.html(ReactDOMServer.renderToString(createRoughStrokeEffect('roughEffect')));
    }
    
    // Add pattern for fill
    if (barFill && barFillPattern !== 'solid') {
      const pattern = createFillPattern(barFillPattern, barColor !== 'transparent' ? barColor : '#333');
      if (pattern) {
        defs.html(defs.html() + ReactDOMServer.renderToString(pattern));
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
        yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) * 1.1
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
    
    // Add bars with updated stroke style
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
    
    // Apply stroke attributes function
    const applyStrokeAttributes = (selection) => {
      if (barStrokeWidth <= 0) {
        selection
          .attr('stroke', 'none')
          .attr('stroke-width', 0);
        return;
      }
      
      // Apply stroke attributes
      selection
        .attr('stroke', barStrokeColor)
        .attr('stroke-width', barStrokeWidth)
        .attr('stroke-dasharray', getStrokeDashArray(barStrokePattern));
        
      // Apply stroke style filter if not normal
      if (barStrokeStyle !== 'normal') {
        selection.attr('filter', `url(#${barStrokeStyle}Effect)`);
      }
    };
    
    // Apply the stroke attributes
    applyStrokeAttributes(bars);
    
    chartRef.current = { g, x, y };
    
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, 
      barPadding, barColor, barStrokeColor, barStrokeWidth, 
      barFill, barFillOpacity, barFillPattern, barStrokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax, barStrokeStyle, barDashArray]);

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
  const resizeHandleStyle = {
    cursor: 'nwse-resize',
    backgroundColor: '#ccc',
    opacity: isResizing ? 0.6 : 0.3,
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 15,
    height: 15
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="chart-wrapper" style={{ position: 'relative', width, height }}>
        <svg ref={svgRef} width={width} height={height}>
          {/* Chart will be rendered here by D3 */}
          
          {/* If we have a template, render it for each bar */}
          {template && barData.map((bar, i) => {
            const TemplateComponent = template;
            return (
              <g 
                key={`template-${templateKey}-bar-${i}`} 
                transform={`translate(${marginLeft}, ${marginTop})`}
                className="template-bar"
              >
                <TemplateComponent
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  color={bar.color}
                  strokeColor={bar.strokeColor}
                  strokeWidth={bar.strokeWidth}
                />
              </g>
            );
          })}
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