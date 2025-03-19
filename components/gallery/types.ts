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
  showPoints: boolean;
  pointRadius: number;
  showXAxis: boolean;
  showYAxis: boolean;
  yDomainMin?: number;
  yDomainMax?: number;
}

export type ChartConfig = BarChartConfig | LineChartConfig; 