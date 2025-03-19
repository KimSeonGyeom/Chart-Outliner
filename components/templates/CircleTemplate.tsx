"use client";

import React from 'react';
import { TemplateProps } from './types';

const CircleTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'transparent',
  className = '',
  strokeColor = '#000',
  strokeWidth = 1,
}) => {
  // Calculate center and radius
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) / 2;
  
  return (
    <circle
      cx={centerX}
      cy={centerY}
      r={radius}
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

export default CircleTemplate; 