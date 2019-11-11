export interface Geometry<T = number[]> {
  type: string;
  coordinates: T;
}

export interface Place {
  id: number;
  place_id?: any;
  client_id: number;
  location_id: string;
  location_name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  lat: string;
  lng: string;
  dma_market: string;
  dma_rank: number;
  heregeodisplat: string;
  heregeodisplon: string;
  heregeonavlat: string;
  heregeonavlon: string;
  heregeoaddress: string;
  heregeocity: string;
  heregeostate: string;
  heregeozipcode: number;
  heregeomatch: string;
  heregeomatchtype: string;
  heregeomatchrelevance: number;
  heregeomatchquality: number;
  display_geometry: Geometry;
  nav_geometry: Geometry;
}

export interface PlaceDetails {
  place: Place | AuditedPlace;
}
export interface PlaceAuditState {
  currentPlace: Place | AuditedPlace;
  nextPlaceId?: number | string;
  clientId: number | string;
}

export interface Status {
  audit_status_cd: number;
  status: string;
}

export interface OutCome {
  audit_outcome_id: number;
  outcome: string;
}

export interface PlaceType {
  place_type_id: number;
  name: string;
}
/** Flat node with expandable and level information */
export class AuditPlaceNode {
  constructor(
    public name: string,
    public count: number,
    public level = 1,
    public placeId: any,
    public id = '',
    public expandable = false,
    public isLoading = false,
    public parent = '',
    public superParent = '',
    public isExpand = false,
    public children = []
  ) {}
}
export interface Polygon {
  type?: string;
  coordinates?: any;
}

export interface BuildingArea {
  no_floors?: number;
  no_entrances?: number;
  no_concourses?: number;
  no_platforms?: number;
  no_gates?: number;
  geometry?: Polygon;
}

export interface OpenHours<T = string> {
  su?: T;
  mo?: T;
  tu?: T;
  we?: T;
  th?: T;
  fr?: T;
  sa?: T;
}
export interface Hours {
  from: string;
  to: string;
}


export interface AuditedPlace {
  open_hours: OpenHours<string>;
  building_area: BuildingArea;
  place_id: string;
  parent_place_id?: any;
  location_name: string;
  short_name?: any;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  iso_country_code: string;
  display_geometry: Geometry;
  nav_geometry: Geometry;
  place_type_id?: number;
  audit_status_cd: number;
  cleansed_address_id: string;
  audit_outcome_id?: any;
  property_area_id?: any;
  safegraph_id?: any;
  here_id?: any;
  census_id?: any;
  property_geometry?: any;
  is_focused?: any;
  is_data_collection_area?: any;
  is_active?: any;
  create_user: string;
  update_user: string;
  create_ts: Date;
  update_ts: Date;
}
export interface CreatePlaceReq {
  client_id: number | string;
  building_area: BuildingArea;
  audit_outcome_id: number;
  location_name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  iso_country_code: string;
  here_id?: string;
  safegraph_id: string;
  census_id?: string;
  property_geometry: Polygon;
  open_hours: OpenHours<string>;
  is_focused: boolean;
  is_active: boolean;
  is_data_collection_area: boolean;
  display_geometry: Geometry;
  nav_geometry: Geometry;
  audit_status_cd?: number;
  place_type_id: number;
  parent_place_id?: string;
}
export interface PlaceCreateResponse {
  place_id: string;
}


export type  AreaType = 'building' | 'property';

export type ElasticSearchType = 'safegraphId' | 'hereID' | 'placeName';