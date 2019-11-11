export interface CustomProps {
  customText: string;
  customLogo: string | File;
}
export interface FilterPillTypes {
  audience: boolean;
  market: boolean;
  filters: boolean;
  // unitIds: boolean;
  'saved view': boolean;
}
export interface DisplayOptions {
  mapLegend: boolean;
  mapControls: boolean;
  pills: FilterPillTypes;
  filterPills: FilterPillTypes;
  customProps: CustomProps;
  baseMap: any;
}
