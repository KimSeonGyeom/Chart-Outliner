"use client";

import React from 'react';
import { TemplateProps } from './types';

const TriangleTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'transparent',
  className = '',
  strokeColor = '#000',
  strokeWidth = 1,
}) => {
  // Calculate triangle points
  const points = `
    ${x + width / 2},${y}
    ${x},${y + height}
    ${x + width},${y + height}
  `;
  
  return (
    <polygon
      points={points}
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

export default TriangleTemplate; 