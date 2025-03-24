// Shared types for chart control panels

import { ChartData } from '../templates/types';
import { SavedChartData, BarChartConfig, LineChartConfig } from '../gallery/types';

// Chart type
export type ChartType = 'bar' | 'line';

// Base chart dimensions shared by all chart types
export interface ChartDimensions {
  width: number;
  height: number;
}

// Axis options shared by all chart types
export interface AxisOptions {
  showXAxis: boolean;
  showYAxis: boolean;
  yDomainMin?: number;
  yDomainMax?: number;
}

// Base control panel props shared by all control panels
export interface BaseControlPanelProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  onSaveClick: () => void;
  onExportClick?: () => void;
  showExportOptions?: boolean;
  exportOptions?: React.ReactNode;
}

// Props for the dimensions section component
export interface DimensionsSectionProps {
  dimensions: ChartDimensions;
  onDimensionChange: (dimension: keyof ChartDimensions, value: number) => void;
}

// Props for the axes section component
export interface AxisSectionProps {
  axisOptions: AxisOptions;
  onAxisOptionChange: (option: keyof AxisOptions, value: boolean | number | undefined) => void;
}

// Props for the domain section component
export interface DomainSectionProps {
  yDomainMin: number | undefined;
  yDomainMax: number | undefined;
  onDomainChange: (min: number | undefined, max: number | undefined) => void;
}

// Props for chart type selection component
export interface ChartTypeSelectorProps {
  activeChart: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

// Bar chart specific options
export interface BarChartOptions {
  barPadding: number;
  selectedTemplate: string;
  barFill: boolean;
  barFillOpacity: number;
  barStrokePattern: string;
  barFillPattern: string;
  barFillZoomLevel: number;
  barStrokeWidth: number;
  barStrokeStyle: string;
  barDashArray: string;
}

// Line chart specific options
export interface LineChartOptions {
  curveType: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension: number;
  fill: boolean;
  fillOpacity: number;
  fillPattern: string;
  fillZoomLevel: number;
  showPoints: boolean;
  pointRadius: number;
  pointShape: string;
  pointStrokeWidth: number;
  lineStrokePattern: string;
  lineStrokeWidth: number;
  lineStrokeStyle: string;
  lineDashArray: string;
}

// Props for bar chart template section
export interface BarTemplateSectionProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

// Props for bar appearance section
export interface BarAppearanceSectionProps {
  barPadding: number;
  barFill: boolean;
  barFillOpacity: number;
  barFillPattern: string;
  barFillZoomLevel: number;
  onBarPaddingChange: (padding: number) => void;
  onBarFillChange: (fill: boolean) => void;
  onBarFillOpacityChange: (opacity: number) => void;
  onBarFillPatternChange: (pattern: string) => void;
  onBarFillZoomLevelChange: (zoomLevel: number) => void;
}

// Props for line appearance section
export interface LineAppearanceSectionProps {
  curveType: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension: number;
  onCurveTypeChange: (type: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear') => void;
  onCurveTensionChange: (tension: number) => void;
}

// Props for line fill section
export interface LineFillSectionProps {
  fill: boolean;
  fillOpacity: number;
  fillPattern: string;
  fillZoomLevel: number;
  onFillChange: (fill: boolean) => void;
  onFillOpacityChange: (opacity: number) => void;
  onFillPatternChange: (pattern: string) => void;
  onFillZoomLevelChange: (zoomLevel: number) => void;
}

// Props for point options section
export interface PointsSectionProps {
  showPoints: boolean;
  pointRadius: number;
  pointShape: string;
  pointStrokeWidth?: number;
  onShowPointsChange: (show: boolean) => void;
  onPointRadiusChange: (radius: number) => void;
  onPointShapeChange: (shape: string) => void;
  onPointStrokeWidthChange?: (width: number) => void;
}

// Props for save dialog
export interface SaveDialogProps {
  isOpen: boolean;
  chartName: string;
  onClose: () => void;
  onSave: () => void;
  onChartNameChange: (name: string) => void;
}

// Props for download dialog
export interface DownloadDialogProps {
  isOpen: boolean;
  chartName: string;
  onClose: () => void;
  onDownload: (fileName: string, fileType: 'png' | 'jpg' | 'svg', asOutlines: boolean, wireframeStyle?: boolean) => void;
  onFileNameChange: (name: string) => void;
  wireframeStyle?: boolean;
  onWireframeStyleChange?: (wireframe: boolean) => void;
}

// Save chart functionality
export interface SaveChartConfig {
  chartRef: React.RefObject<HTMLDivElement>;
  chartName: string;
  chartType: ChartType;
  getChartConfig: () => BarChartConfig | LineChartConfig;
  onSaveSuccess: () => void;
  onSaveError: (error: any) => void;
}

// Props for stroke pattern section
export interface StrokePatternSectionProps {
  strokePattern: string;
  strokeWidth: number;
  strokeStyle: string;
  dashArray: string;
  onStrokePatternChange: (pattern: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onStrokeStyleChange: (style: string) => void;
  onDashArrayChange: (dashArray: string) => void;
}

// Props for fill pattern section
export interface FillPatternSectionProps {
  fillPattern: string;
  fillZoomLevel: number;
  onFillPatternChange: (pattern: string) => void;
  onFillZoomLevelChange: (zoomLevel: number) => void;
}

// DataSection props
export interface DataSectionProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onRandomize: () => void;
  chartType: 'line' | 'bar';
} 