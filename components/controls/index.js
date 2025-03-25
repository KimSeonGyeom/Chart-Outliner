"use client";

// Export utility functions
export { downloadChart } from './downloadUtils.js';

// Export main control panel
export { default as ControlPanel } from './ControlPanel.jsx';
export { default as ChartTypeSelector } from './ChartTypeSelector.jsx';
export { default as SaveDialog } from './SaveDialog.jsx';
export { default as ExportVariationsButton } from './ExportVariationsButton.jsx';

// Export shared sections
export { default as DimensionsSection } from './shared/DimensionsSection.jsx';
export { default as AxisSection } from './shared/AxisSection.jsx';
export { default as DomainSection } from './shared/DomainSection.jsx';
export { default as StrokePatternSection } from './shared/StrokePatternSection.jsx';
export { default as FillPatternSection } from './shared/FillPatternSection.jsx';
export { default as DataSection } from './shared/DataSection.jsx'; 

// Export bar chart sections
export { default as BarTemplateSection } from './bar/BarTemplateSection.jsx';
export { default as BarAppearanceSection } from './bar/BarAppearanceSection.jsx';

// Export line chart sections
export { default as LineAppearanceSection } from './line/LineAppearanceSection.jsx';
export { default as LineFillSection } from './line/LineFillSection.jsx';
export { default as PointsSection } from './line/PointsSection.jsx';