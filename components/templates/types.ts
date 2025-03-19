export interface TemplateProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  color?: string;
}

export type ChartData = ChartDataPoint[]; 