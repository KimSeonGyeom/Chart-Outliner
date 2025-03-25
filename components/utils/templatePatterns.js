import React from 'react';
import RectangleTemplate from '../templates/RectangleTemplate';
import CircleTemplate from '../templates/CircleTemplate';
import TriangleTemplate from '../templates/TriangleTemplate';
import DiamondTemplate from '../templates/DiamondTemplate';

/**
 * Creates a template pattern definition for SVG filling
 * @param {string} templateType - The template shape (rectangle, circle, etc.)
 * @param {number} density - How many templates to include (1-20)
 * @param {number} size - Size of each template
 * @param {number} opacity - Opacity of the templates
 * @param {string} patternId - Unique ID for the pattern
 * @returns {JSX.Element} SVG pattern definition
 */
export const createTemplatePattern = (templateType, density, size, opacity, patternId) => {
  // Calculate pattern dimensions based on density (higher density = smaller cell size)
  const cellSize = 100 / Math.max(1, density);
  
  // Generate a grid of templates
  const templates = [];
  
  // Create a staggered grid layout for more natural appearance
  for (let i = 0; i < density; i++) {
    for (let j = 0; j < density; j++) {
      // Add some randomness to position
      const offsetX = (i % 2) * (cellSize / 2);
      const x = (j * cellSize) + offsetX;
      const y = i * cellSize;
      
      // Randomize size slightly for more organic feel (between 70-100% of specified size)
      const sizeVariation = 0.7 + (Math.random() * 0.3);
      const templateSize = size * sizeVariation;

      // Add template to the grid
      templates.push(
        getTemplateComponent(
          templateType,
          x,
          y,
          templateSize,
          templateSize,
          opacity
        )
      );
    }
  }
  
  return (
    <pattern 
      id={patternId} 
      patternUnits="userSpaceOnUse" 
      width={cellSize * density} 
      height={cellSize * density}
    >
      {templates}
    </pattern>
  );
};

/**
 * Returns the appropriate template component based on type
 */
const getTemplateComponent = (type, x, y, width, height, opacity) => {
  const key = `template-${x}-${y}`;
  const props = {
    key,
    x,
    y,
    width,
    height,
    color: '#000',
    strokeColor: 'none',
    strokeWidth: 0,
    style: { opacity }
  };

  switch (type) {
    case 'rectangle':
      return <RectangleTemplate {...props} />;
    case 'circle':
      return <CircleTemplate {...props} />;
    case 'triangle':
      return <TriangleTemplate {...props} />;
    case 'diamond':
      return <DiamondTemplate {...props} />;
    default:
      return <RectangleTemplate {...props} />;
  }
}; 