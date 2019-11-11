import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-explore-inventory-interset',
  templateUrl: './explore-inventory-interset.component.html',
  styleUrls: ['./explore-inventory-interset.component.less']
})
export class ExploreInventoryIntersetComponent implements OnInit {

  constructor() { }
  public interset: any;
  public placeDetail: string;
  public isFeature = false;

  ngOnInit() {
    const properties = this.interset.feature.properties;
    this.placeDetail = this.interset.feature.properties;
    if (this.interset.type !== 'outside' && this.interset.features.length > 1) {
      this.isFeature = true;
    }
  }

}
