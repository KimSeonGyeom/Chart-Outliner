export interface TemplateProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  color?: string;
}

export type ChartData = ChartDataPoint[]; 