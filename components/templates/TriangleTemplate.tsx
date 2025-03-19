"use client";

import React from 'react';
import { TemplateProps } from './types';

const TriangleTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'steelblue',
  className = '',
}) => {
  // Create a triangle pointing upward
  // Using absolute positioning since we'll place this within a transformed group
  const points = `0,${height} ${width/2},0 ${width},${height}`;

  return (
    <polygon 
      points={points}
      fill={color}
      className={className}
    />
  );
};

export default TriangleTemplate; 