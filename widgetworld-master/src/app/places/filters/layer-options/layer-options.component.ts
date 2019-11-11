import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { LayersService } from '../../../explore/layer-display-options/layers.service';
import { combineLatest, Subject } from 'rxjs';
import { PlacesDataService } from '@shared/services';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layer-options',
  templateUrl: './layer-options.component.html',
  styleUrls: ['./layer-options.component.less']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerOptionsComponent implements OnInit, OnDestroy {
  private layerDisplayOptions: any = {};
  private unSubscribe: Subject<void> = new Subject<void>();
  private layers: any = [];
  constructor(
    private layersService: LayersService,
    private placesDataService: PlacesDataService
  ) { }

  ngOnInit() {
    combineLatest(this.layersService.getDisplayOptions()).pipe(takeUntil(this.unSubscribe)).subscribe((options) => {
      this.layerDisplayOptions = options[0];
    });

    this.placesDataService.onMapLoad().pipe(takeUntil(this.unSubscribe)).subscribe(() => {
      this.layersService.setApplyLayers(true);
    });

    this.layersService.getLayers().pipe(takeUntil(this.unSubscribe)).subscribe((layers) => {
      if (layers) {
        this.layers = layers;
      }
    });
  }

  public onApply() {
    this.layersService.saveLayersSession({
      display: this.layerDisplayOptions,
      customLogoInfo: this.layersService.customLogo,
      selectedLayers: this.layers
    }, true);
    this.layersService.setApplyLayers(true);
  }

  public clearAll() {
    this.layersService.setApplyLayers(false);
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
