"use client";

import React from 'react';
import { TemplateProps } from './types';

const DiamondTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'transparent',
  className = '',
  strokeColor = '#000',
  strokeWidth = 1,
}) => {
  // Calculate diamond points
  const points = `
    ${x + width / 2},${y}
    ${x + width},${y + height / 2}
    ${x + width / 2},${y + height}
    ${x},${y + height / 2}
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

export default DiamondTemplate; 