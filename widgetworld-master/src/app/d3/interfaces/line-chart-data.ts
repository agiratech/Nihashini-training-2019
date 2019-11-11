export interface LineChartData {
  name: string | Date | number;
  value: number;
  index?: number;
}
export interface LineChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface LineChartOptions {
  width: number;
  height: number;
  tooltip: string;
  xAxis?: boolean;
  yAxis?: boolean;
  margin: LineChartMargin;
}
