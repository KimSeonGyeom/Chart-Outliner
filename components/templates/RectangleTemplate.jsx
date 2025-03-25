"use client";

import React from 'react';

const RectangleTemplate = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'transparent',
  className = '',
  strokeColor = '#000',
  strokeWidth = 1,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className={className}
      rx={2}
      ry={2}
    />
  );
};

export default RectangleTemplate; 