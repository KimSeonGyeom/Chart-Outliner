"use client";

import React from 'react';
import { TemplateProps } from './types';

const RectangleTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'steelblue',
  className = '',
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      className={className}
      rx={2}
      ry={2}
    />
  );
};

export default RectangleTemplate; 