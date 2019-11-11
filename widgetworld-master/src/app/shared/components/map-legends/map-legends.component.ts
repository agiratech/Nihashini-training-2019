import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {MapLegendsService} from '@shared/services';
import {takeWhile} from 'rxjs/operators';

@Component({
  selector: 'app-map-legends',
  templateUrl: './map-legends.component.html',
  styleUrls: ['./map-legends.component.less']
})
export class MapLegendsComponent implements OnInit, OnDestroy {
  public show = false;
  objectKeys = Object.keys;
  private unSubscribe = true;
  public legends: any = [];
  @Input() module: any;
  constructor(
    private dataService: MapLegendsService
  ) {
  }

  ngOnInit() {
    this.dataService
      .keyLegendsSubscriber()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(result => {
        this.legends = result;
      });
  }

  public toggle() {
    this.show = !this.show;
  }
  ngOnDestroy() {
    this.legends = [];
    this.unSubscribe = false;
  }
}
