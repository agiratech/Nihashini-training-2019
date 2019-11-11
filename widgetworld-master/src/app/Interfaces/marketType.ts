export class Market {
  id: any;
  name: string;
  type: string;
}

export type  MarketType = 'DMA' | 'CBSA';

export type  SelectionType = 'Single' | 'Multi';

export type ModuleName = 'explore' | 'place' | 'workspace';
