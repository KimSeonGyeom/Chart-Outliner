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
      className={className}
    />
  );
};

export default TriangleTemplate; 