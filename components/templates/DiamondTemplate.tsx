"use client";

import React from 'react';
import { TemplateProps } from './types';

const DiamondTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'steelblue',
  className = '',
}) => {
  // Create a diamond shape
  // Using absolute positioning since we'll place this within a transformed group
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const points = `${halfWidth},0 ${width},${halfHeight} ${halfWidth},${height} 0,${halfHeight}`;

  return (
    <polygon 
      points={points}
      fill={color}
      className={className}
    />
  );
};

export default DiamondTemplate; 