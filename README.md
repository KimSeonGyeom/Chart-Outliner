# Chart Outliner

A Next.js application for creating customizable charts with D3.js, featuring template-based mark rendering.

## Features

- Three chart types: Bar Chart, Line Chart, and Area Chart
- Custom shape templates that can be applied to any chart type
- Built with Next.js, TypeScript, and D3.js
- Responsive design

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Templates

The application includes two default shape templates:

1. **Triangle Template** - Renders triangular markers
2. **Diamond Template** - Renders diamond-shaped markers

You can create your own custom templates by following the template interface pattern found in `components/templates/types.ts`.

## Creating Custom Templates

1. Create a new file in `components/templates/` directory
2. Implement the `TemplateProps` interface
3. Export your new template from `components/index.ts`

Example:

```typescript
import React from 'react';
import { TemplateProps } from './types';

const CustomTemplate: React.FC<TemplateProps> = ({
  x,
  y,
  width = 10,
  height = 10,
  color = 'steelblue',
  className = '',
}) => {
  // Implement your custom shape here
  return (
    <YourSvgElement 
      // Use props to position and style
    />
  );
};

export default CustomTemplate;
```

## License

MIT
