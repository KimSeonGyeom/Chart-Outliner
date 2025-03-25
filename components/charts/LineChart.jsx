"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ReactDOMServer from 'react-dom/server';

const LineChart = ({
  data,
  width = 512,
  height = 512,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  fill = false,
  fillOpacity = 0.0,
  fillPattern = 'solid',
  fillZoomLevel = 8,
  
  // Curve parameters
  curveType = 'linear',
  curveTension = 0.5,
  
  // Line appearance
  lineColor = '#000',
  lineWidth = 1,
  lineDash,
  lineStrokePattern = 'solid',
  lineStrokeWidth = 1,
  lineStrokeStyle = 'normal',
  lineDashArray = '6,4',
  
  // Point appearance
  showPoints = true,
  pointRadius = 3,
  pointShape = 'circle',
  pointStroke = '#000',
  pointStrokeWidth = 1,
  
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
  const [dataPoints, setDataPoints] = useState([]);
  
  // State for resize tracking
  const [isResizing, setIsResizing] = useState(false);
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({ width, height });

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
      return lineDashArray;
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
    const size = Math.max(1, fillZoomLevel);

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
    if (!fill) return 'transparent';
    if (pattern === 'solid') return color;
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
  
  // Get the stroke style props based on style selection
  const getStrokeStyleProps = () => {
    const props = {
      strokeWidth: lineStrokeWidth > 0 ? lineStrokeWidth : 0
    };
    
    if (lineStrokeStyle !== 'normal' && lineStrokeWidth > 0) {
      props.filter = `url(#${lineStrokeStyle}Effect)`;
    }
    
    return props;
  };

  // Helper function to create SVG path for custom shapes
  const createPointShape = (shape, x, y, radius) => {
    switch (shape) {
      case 'square':
        return `M${x - radius},${y - radius} h${radius * 2} v${radius * 2} h${-radius * 2} z`;
      case 'triangle':
        return `M${x},${y - radius} L${x + radius * 0.866},${y + radius * 0.5} L${x - radius * 0.866},${y + radius * 0.5} z`;
      case 'diamond':
        return `M${x},${y - radius} L${x + radius},${y} L${x},${y + radius} L${x - radius},${y} z`;
      case 'cross':
        const crossWidth = radius * 0.3;
        return `M${x - radius},${y - crossWidth} h${radius - crossWidth} v${-radius + crossWidth} h${crossWidth * 2} v${radius - crossWidth} h${radius - crossWidth} v${crossWidth * 2} h${-radius + crossWidth} v${radius - crossWidth} h${-crossWidth * 2} v${-radius + crossWidth} z`;
      case 'star':
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        let path = `M${x},${y - outerRadius} `;
        
        for (let i = 0; i < 5; i++) {
          const outerAngle = Math.PI / 2 + i * Math.PI * 2 / 5;
          const innerAngle = outerAngle + Math.PI / 5;
          
          const outerX = x + Math.cos(outerAngle) * outerRadius;
          const outerY = y - Math.sin(outerAngle) * outerRadius;
          const innerX = x + Math.cos(innerAngle) * innerRadius;
          const innerY = y - Math.sin(innerAngle) * innerRadius;
          
          path += `L${innerX},${innerY} L`;
          
          if (i === 4) {
            path += `${x},${y - outerRadius}`;
          } else {
            const nextOuterAngle = Math.PI / 2 + (i + 1) * Math.PI * 2 / 5;
            const nextOuterX = x + Math.cos(nextOuterAngle) * outerRadius;
            const nextOuterY = y - Math.sin(nextOuterAngle) * outerRadius;
            path += `${nextOuterX},${nextOuterY} `;
          }
        }
        
        return path;
      case 'circle':
      default:
        return null; // Use circle element for circles
    }
  };

  // Update chart with new data
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Get the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add defs for patterns and filters
    const defs = svg.append('defs');
    
    // Add SVG filters for stroke styles
    if (lineStrokeStyle === 'brush') {
      defs.html(ReactDOMServer.renderToString(createBrushStrokeEffect('brushEffect')));
    } else if (lineStrokeStyle === 'sketch') {
      defs.html(ReactDOMServer.renderToString(createSketchStrokeEffect('sketchEffect')));
    } else if (lineStrokeStyle === 'rough') {
      defs.html(ReactDOMServer.renderToString(createRoughStrokeEffect('roughEffect')));
    }
    
    // Add pattern for fill
    if (fill && fillPattern !== 'solid') {
      const pattern = createFillPattern(fillPattern, lineColor);
      if (pattern) {
        defs.html(defs.html() + ReactDOMServer.renderToString(pattern));
      }
    }

    // Calculate inner dimensions
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);

    const yMin = yDomainMin !== undefined ? yDomainMin : d3.min(data, d => d.y) || 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(data, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([Math.min(0, yMin), yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Create line generator with specified curve
    const getCurveFunction = (type) => {
      switch (type) {
        case 'cardinal':
          return d3.curveCardinal.tension(curveTension);
        case 'basis':
          return d3.curveBasis;
        case 'natural':
          return d3.curveNatural;
        case 'monotone':
          return d3.curveMonotoneX;
        case 'catmullRom':
          return d3.curveCatmullRom.alpha(curveTension);
        case 'linear':
        default:
          return d3.curveLinear;
      }
    };

    const line = d3.line()
      .x(d => x(String(d.x)) || 0)
      .y(d => y(d.y))
      .curve(getCurveFunction(curveType));

    // Add area if fill is enabled
    if (fill) {
      const area = d3.area()
        .x(d => x(String(d.x)) || 0)
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(getCurveFunction(curveType));

      g.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', getFillValue(fillPattern, lineColor))
        .attr('fill-opacity', fillOpacity);
    }

    // Add line with updated stroke properties
    g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', lineStrokeWidth > 0 ? lineColor : 'none')
      .attr('stroke-width', lineStrokeWidth)
      .attr('stroke-dasharray', lineStrokeWidth > 0 ? getStrokeDashArray(lineStrokePattern) : 'none')
      .call(sel => {
        // Apply stroke style filter if not normal and stroke width > 0
        if (lineStrokeStyle !== 'normal' && lineStrokeWidth > 0) {
          sel.attr('filter', `url(#${lineStrokeStyle}Effect)`);
        }
      });

    // Add points if enabled
    if (showPoints && pointRadius > 0) {
      // Store the data points for external use
      const pointsData = data.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || lineColor
      }));
      setDataPoints(pointsData);

      if (pointShape === 'circle') {
        // Use circles for circle shapes
        g.selectAll('.point')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('cx', d => x(String(d.x)) || 0)
          .attr('cy', d => y(d.y))
          .attr('r', pointRadius)
          .attr('fill', d => d.color || lineColor)
          .attr('stroke', pointStroke)
          .attr('stroke-width', pointStrokeWidth);
      } else {
        // Use SVG paths for other shapes
        g.selectAll('.point')
          .data(data)
          .enter()
          .append('path')
          .attr('class', 'point')
          .attr('d', d => {
            const pointX = x(String(d.x)) || 0;
            const pointY = y(d.y);
            return createPointShape(pointShape, pointX, pointY, pointRadius);
          })
          .attr('fill', d => d.color || lineColor)
          .attr('stroke', pointStroke)
          .attr('stroke-width', pointStrokeWidth);
      }
    } else if (showPoints) {
      // Just store data points for external use without rendering them
      const pointsData = data.map(d => ({
        x: x(String(d.x)) || 0,
        y: y(d.y),
        color: d.color || lineColor
      }));
      setDataPoints(pointsData);
    }

    // Add axes if enabled
    if (showXAxis) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));
    }

    if (showYAxis) {
      g.append('g')
        .call(d3.axisLeft(y));
    }

    // Store chart references
    chartRef.current = { g, x, y };

  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, 
      curveType, curveTension, lineColor, lineWidth, fill, fillOpacity, fillPattern,
      showPoints, pointRadius, pointShape, pointStroke, pointStrokeWidth, lineStrokePattern,
      showXAxis, showYAxis, yDomainMin, yDomainMax, lineStrokeWidth, lineStrokeStyle, lineDashArray]);
  
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

export default LineChart; 