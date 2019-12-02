import { Component,Input,OnInit } from '@angular/core';
import {Map} from './map';

@Component({
  selector: 'app-inventory-map-detail',
  templateUrl: './inventory-map-detail.component.html',
  styleUrls: ['./inventory-map-detail.component.less']
})
export class InventoryMapDetailComponent implements OnInit {
  @Input() mapDetail:Map;

  constructor(  ) {}

  ngOnInit() {
    console.log('featurechild', this.mapDetail);
    // this.feature = this.feature.location;
    // this.mapDetail = this.mapDetail.staticMapURL;

  
  }  
    
}
