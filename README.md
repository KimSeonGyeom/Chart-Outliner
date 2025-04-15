# Chart Outliner

Chart Outliner is an interactive tool for creating, customizing, and saving SVG-based charts. It provides a user-friendly interface for modifying chart properties and dimensions in real time.

## Features

### Interactive Charts
- **Bar Chart**: Create customizable bar charts with responsive controls

### Chart Customization
- **Appearance**: Customize colors, opacity, point display, and more
- **Axes**: Toggle axis visibility and configure tick counts
- **Special Features**: 
  - Bar charts: Customize padding and bar styles

### Gallery & Saving
- **Save Charts**: Save your charts as images with all configuration settings
- **Gallery View**: Browse, load, and delete your saved charts
- **Local Storage**: All saved charts are stored in the browser's localStorage

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser and navigate to http://localhost:3000

## Using the Application

1. Select a chart type (Bar Chart only)
2. Customize the chart using the control panel
3. Resize the chart by dragging the bottom-right corner
4. Save your chart to the gallery by clicking "Save Chart"
5. Access your saved charts by clicking "Gallery"

## Technologies Used

- Next.js
- React
- D3.js
- TypeScript
- SCSS
- html2canvas (for saving charts as images)

## License

MIT
