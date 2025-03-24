// Types for chart gallery

export interface SavedChartData {
  id: string;
  name: string;
  type: 'bar' | 'line';
  timestamp: number;
  imageUrl: string;
  config: ChartConfig;
}

export interface BarChartConfig {
  width: number;
  height: number;
  barPadding: number;
  barFill?: boolean;
  barFillOpacity?: number;
  barFillPattern?: string;
  barFillZoomLevel?: number;
  barStrokePattern?: string;
  barStrokeWidth?: number;
  barStrokeStyle?: string;
  barDashArray?: string;
  showXAxis: boolean;
  showYAxis: boolean;
  yDomainMin?: number;
  yDomainMax?: number;
  selectedTemplate: string;
}

export interface LineChartConfig {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  curveType: 'cardinal' | 'basis' | 'natural' | 'monotone' | 'catmullRom' | 'linear';
  curveTension: number;
  fill: boolean;
  fillOpacity: number;
  fillPattern?: string;
  fillZoomLevel?: number;
  showPoints: boolean;
  pointRadius: number;
  pointShape?: string;
  pointStrokeWidth?: number;
  lineStrokePattern?: string;
  lineStrokeWidth?: number;
  lineStrokeStyle?: string;
  lineDashArray?: string;
  showXAxis: boolean;
  showYAxis: boolean;
  yDomainMin?: number;
  yDomainMax?: number;
}

export type ChartConfig = BarChartConfig | LineChartConfig; 