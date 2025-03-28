"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ReactDOMServer from 'react-dom/server';
import { useDataStore } from '../store/dataStore';
import { useSharedStore } from '../store/sharedStore';
import { useChartStore } from '../store/chartStore';

const LineChart = () => {
  // Get data and settings from stores
  const chartData = useDataStore((state) => state.chartData.data);
  const subject = useDataStore((state) => state.chartData.subject);
  
  // Get shared settings
  const chartWidth = useSharedStore((state) => state.width);
  const chartHeight = useSharedStore((state) => state.height);
  const showXAxis = useSharedStore((state) => state.showXAxis);
  const showYAxis = useSharedStore((state) => state.showYAxis);
  const yDomainMin = useSharedStore((state) => state.yDomainMin);
  const yDomainMax = useSharedStore((state) => state.yDomainMax);
  const fill = useSharedStore((state) => state.fill);
  const fillPattern = useSharedStore((state) => state.fillPattern);
  const fillZoomLevel = useSharedStore((state) => state.fillZoomLevel);
  const fillOpacity = useSharedStore((state) => state.fillOpacity);
  const strokeColor = useSharedStore((state) => state.strokeColor);
  const strokeWidth = useSharedStore((state) => state.strokeWidth);
  const strokePattern = useSharedStore((state) => state.strokePattern);
  const dashArray = useSharedStore((state) => state.dashArray);
  
  // Get transformation settings
  const transformationType = useSharedStore((state) => state.transformationType);
  const translationX = useSharedStore((state) => state.translationX);
  const translationY = useSharedStore((state) => state.translationY);
  const scaleX = useSharedStore((state) => state.scaleX);
  const scaleY = useSharedStore((state) => state.scaleY);
  const rotation = useSharedStore((state) => state.rotation);
  const skewX = useSharedStore((state) => state.skewX);
  const skewY = useSharedStore((state) => state.skewY);
  const perspective = useSharedStore((state) => state.perspective);
  const distortionType = useSharedStore((state) => state.distortionType);
  const distortionAmount = useSharedStore((state) => state.distortionAmount);
  
  // Get chart-specific settings
  const curveType = useChartStore((state) => state.curveType);
  const curveTension = useChartStore((state) => state.curveTension);
  const showPoints = useChartStore((state) => state.showPoints);
  const pointRadius = useChartStore((state) => state.pointRadius);
  const pointShape = useChartStore((state) => state.pointShape);
  
  // Other state
  const svgRef = useRef(null);
  const chartRef = useRef(null);

  // Define margins for axes
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  // Calculate the inner dimensions of the chart
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Calculate the stroke-dasharray value based on the pattern
  const getStrokeDashArray = (pattern) => {
    if (pattern === 'custom') {
      return dashArray;
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

  // Create fill pattern function (missing in original code)
  const createFillPattern = () => {
    // Size based on the zoom level
    const size = Math.max(1, fillZoomLevel);
    
    switch (fillPattern) {
      case 'diagonal':
        return (
          <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M-1,1 l2,-2 M0,${size} l${size},-${size} M${size-1},${size+1} l1,-1`} stroke="#000" strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'crosshatch':
        return (
          <pattern id="crosshatchPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 l${size},${size} M${size},0 l-${size},${size}`} stroke="#000" strokeWidth={Math.max(0.5, size/8)} />
          </pattern>
        );
      case 'dots':
        const radius = Math.max(0.5, size/5);
        return (
          <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <circle cx={size/2} cy={size/2} r={radius} fill="#000" />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id="gridPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,0 h${size} M0,${size} h${size} M0,0 v${size} M${size},0 v${size}`} stroke="#000" strokeWidth={Math.max(0.5, size/12)} />
          </pattern>
        );
      case 'zigzag':
        return (
          <pattern id="zigzagPattern" patternUnits="userSpaceOnUse" width={size} height={size}>
            <path d={`M0,${size/2} l${size/2},-${size/2} l${size/2},${size/2}`} stroke="#000" strokeWidth={Math.max(0.5, size/8)} fill="none" />
          </pattern>
        );
      default:
        return null;
    }
  };

  // Function to apply transformation to chart elements
  const applyTransformation = (selection) => {
    if (!transformationType || transformationType === 'none') return selection;
    
    switch (transformationType) {
      case 'translation':
        return selection.attr('transform', `translate(${translationX || 0}, ${translationY || 0})`);
        
      case 'affine':
        // Affine transformation includes rotation, scaling, and skewing
        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        return selection.attr('transform', 
          `translate(${centerX}, ${centerY}) 
           rotate(${rotation || 0}) 
           scale(${scaleX || 1}, ${scaleY || 1}) 
           skewX(${skewX || 0}) 
           skewY(${skewY || 0}) 
           translate(${-centerX}, ${-centerY})
           translate(${translationX || 0}, ${translationY || 0})`
        );
        
      case 'projective':
        // For projective transformation, we'll use CSS transform with perspective
        // Apply perspective and some rotation to simulate projective transformation
        return selection.style('transform-origin', 'center')
          .style('transform', 
            `perspective(${perspective || 800}px) 
             rotateX(${rotation || 0}deg) 
             rotateY(${skewX || 0}deg) 
             translateZ(0)`
          );
        
      case 'distortion':
        // For distortion, we'll use SVG filter
        if (!selection.attr('filter')) {
          // Create SVG filter if it doesn't exist
          const defs = d3.select(svgRef.current).select('defs');
          
          // Remove any existing filters
          defs.selectAll('filter').remove();
          
          if (distortionType === 'wave') {
            // Create wave distortion
            const filter = defs.append('filter')
              .attr('id', 'distortionFilter');
              
              filter.append('feTurbulence')
                .attr('type', 'fractalNoise')
                .attr('baseFrequency', '0.01 0.05')
                .attr('numOctaves', '1')
                .attr('seed', '3');
                
                filter.append('feDisplacementMap')
                  .attr('in', 'SourceGraphic')
                  .attr('scale', distortionAmount || 10)
                  .attr('xChannelSelector', 'R')
                  .attr('yChannelSelector', 'G');
          } else if (distortionType === 'barrel' || distortionType === 'pincushion') {
            // Create barrel or pincushion distortion
            const filter = defs.append('filter')
              .attr('id', 'distortionFilter')
              .attr('filterUnits', 'objectBoundingBox')
              .attr('x', '-10%')
              .attr('y', '-10%')
              .attr('width', '120%')
              .attr('height', '120%');
            
            // Create a displacement map for barrel/pincushion distortion
            const amount = distortionType === 'barrel' ? distortionAmount : -distortionAmount;
            const centerX = distortionCenterX || 0.5;
            const centerY = distortionCenterY || 0.5;
            
            // Create turbulence for noise texture
            filter.append('feTurbulence')
              .attr('type', 'turbulence')
              .attr('baseFrequency', '0.05')
              .attr('numOctaves', '2')
              .attr('seed', '1')
              .attr('result', 'noise');
            
            // Create a radial gradient for the displacement map
            const feImage = filter.append('feImage')
              .attr('result', 'displacement-map');
            
            // We need to create an SVG with a radial gradient and embed it as a data URI
            const svgNS = 'http://www.w3.org/2000/svg';
            const gradientSVG = document.createElementNS(svgNS, 'svg');
            gradientSVG.setAttribute('width', '100');
            gradientSVG.setAttribute('height', '100');
            
            const defs2 = document.createElementNS(svgNS, 'defs');
            gradientSVG.appendChild(defs2);
            
            const radialGradient = document.createElementNS(svgNS, 'radialGradient');
            radialGradient.setAttribute('id', 'barrel-gradient');
            radialGradient.setAttribute('cx', centerX);
            radialGradient.setAttribute('cy', centerY);
            radialGradient.setAttribute('r', '0.5');
            radialGradient.setAttribute('fx', centerX);
            radialGradient.setAttribute('fy', centerY);
            defs2.appendChild(radialGradient);
            
            const stop1 = document.createElementNS(svgNS, 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#FFFFFF');
            radialGradient.appendChild(stop1);
            
            const stop2 = document.createElementNS(svgNS, 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#000000');
            radialGradient.appendChild(stop2);
            
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '100');
            rect.setAttribute('height', '100');
            rect.setAttribute('fill', 'url(#barrel-gradient)');
            gradientSVG.appendChild(rect);
            
            // Convert the SVG to a data URI
            const svgString = new XMLSerializer().serializeToString(gradientSVG);
            const dataURI = 'data:image/svg+xml;base64,' + btoa(svgString);
            
            feImage.attr('xlink:href', dataURI);
            
            // Apply displacement map
            filter.append('feDisplacementMap')
              .attr('in', 'SourceGraphic')
              .attr('in2', 'displacement-map')
              .attr('scale', amount)
              .attr('xChannelSelector', 'R')
              .attr('yChannelSelector', 'G');
            
            // Add some blur for smoothing
            filter.append('feGaussianBlur')
              .attr('stdDeviation', '0.5');
          } else if (distortionType === 'curvedHorizon') {
            // Create curved horizon effect (fish-eye on horizontal axis)
            const filter = defs.append('filter')
              .attr('id', 'distortionFilter')
              .attr('filterUnits', 'objectBoundingBox')
              .attr('x', '-10%')
              .attr('y', '-10%')
              .attr('width', '120%')
              .attr('height', '120%');
            
            // We'll use a custom displacement function that curves more at the top/bottom
            const amount = distortionAmount || 10;
            
            // Create a pattern to use for displacement
            filter.append('feImage')
              .attr('result', 'horizon-map')
              .attr('xlink:href', 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                  <defs>
                    <linearGradient id="horizon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#000000" />
                      <stop offset="50%" stop-color="#FFFFFF" />
                      <stop offset="100%" stop-color="#000000" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="100" height="100" fill="url(#horizon-gradient)" />
                </svg>
              `));
            
            // Apply displacement map horizontally only
            filter.append('feDisplacementMap')
              .attr('in', 'SourceGraphic')
              .attr('in2', 'horizon-map')
              .attr('scale', amount)
              .attr('xChannelSelector', 'R')
              .attr('yChannelSelector', 'A');
            
            // Add blur for smoothing
            filter.append('feGaussianBlur')
              .attr('stdDeviation', '0.5');
          }
        }
        
        return selection.attr('filter', 'url(#distortionFilter)');
        
      default:
        return selection;
    }
  };

  // Update chart with new data
  useEffect(() => {
    if (!svgRef.current || !chartData || chartData.length === 0) return;

    // Get the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add defs for patterns and filters
    const defs = svg.append('defs');
    
    // Add pattern for fill
    if (fill && fillPattern !== 'solid') {
      const pattern = createFillPattern();
      if (pattern) {
        defs.html(ReactDOMServer.renderToString(pattern));
      }
    }

    // Create main chart group with margin translation
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scalePoint()
      .domain(chartData.map(d => String(d.x)))
      .range([0, innerWidth])
      .padding(0.5);

    const yMin = yDomainMin !== undefined ? yDomainMin : d3.min(chartData, d => d.y) || 0;
    const yMax = yDomainMax !== undefined ? yDomainMax : d3.max(chartData, d => d.y) || 0;
    
    const y = d3.scaleLinear()
      .domain([Math.min(0, yMin), yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Create line generator with specified curve
    const getCurveFunction = (type) => {
      switch (type) {
        case 'cardinal':
          return d3.curveCardinal.tension(curveTension);
        case 'basis':
          return d3.curveBasis;
        case 'step':
          return d3.curveStep;
        case 'monotone':
          return d3.curveMonotoneX;
        case 'catmullRom':
          return d3.curveCatmullRom.alpha(curveTension);
        case 'linear':
        default:
          return d3.curveLinear;
      }
    };

    // Create a chart group for visualization that will have transformations applied
    const chartVisGroup = g.append('g').attr('class', 'chart-vis-group');

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

      chartVisGroup.append('path')
        .datum(chartData)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', fill ? '#000' : 'none')
        .attr('fill-opacity', fillOpacity);
    }

    // Add line with updated stroke properties
    chartVisGroup.append('path')
      .datum(chartData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', strokeColor || '#000')
      .attr('stroke-width', strokeWidth)
      .attr('stroke-dasharray', getStrokeDashArray(strokePattern));

    // Add points if enabled
    if (showPoints && pointRadius > 0) {
      if (pointShape === 'circle') {
        // Use circles for circle shapes
        chartVisGroup.selectAll('.point')
          .data(chartData)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('cx', d => x(String(d.x)) || 0)
          .attr('cy', d => y(d.y))
          .attr('r', pointRadius)
          .attr('fill', '#000')
      } else {
        // Use SVG paths for other shapes
        chartVisGroup.selectAll('.point')
          .data(chartData)
          .enter()
          .append('path')
          .attr('class', 'point')
          .attr('d', d => {
            const pointX = x(String(d.x)) || 0;
            const pointY = y(d.y);
            return createPointShape(pointShape, pointX, pointY, pointRadius);
          })
          .attr('fill', '#000')
      }
    }

    // Apply transformations to the chart visualization group
    applyTransformation(chartVisGroup);

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

  }, [chartData, chartWidth, chartHeight, 
      curveType, curveTension, strokeColor, fill, fillOpacity, fillPattern,
      showPoints, pointRadius, pointShape, strokePattern, strokeWidth, dashArray,
      showXAxis, showYAxis, yDomainMin, yDomainMax, fillZoomLevel, innerWidth, innerHeight,
      transformationType, translationX, translationY, scaleX, scaleY, 
      rotation, skewX, skewY, perspective, distortionType, distortionAmount]);
  
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
          {/* Chart will be rendered here by D3 */}
        </svg>
      </div>
    </div>
  );
};

export default LineChart; 