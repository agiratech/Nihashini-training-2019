export interface DonutChartData {
  [key: string]: any;
}
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface ChartOptions {
  width: number;
  height: number;
  tooltip?: string;
  margin: ChartMargin;
}
