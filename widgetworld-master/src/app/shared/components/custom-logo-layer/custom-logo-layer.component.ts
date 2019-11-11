import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LayersService } from 'app/explore/layer-display-options/layers.service';
import { PlacesFiltersService } from 'app/places/filters/places-filters.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-custom-logo-layer',
  templateUrl: './custom-logo-layer.component.html',
  styleUrls: ['./custom-logo-layer.component.less']
  // Hide this temp.
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomLogoLayerComponent implements OnInit, OnDestroy {
  public showCustomLogo: any = true;
  public showDraggedLogo = true;
  public logoInfo = {};
  public resizingInProcess = false;
  public enableDraggable = true;
  @Input() logoStyle: object = {};
  public aspectRatio = true;
  @Input() venuesClicked = false;
  @Input() zoomLevel = 0;
  @Input() selectedPlaceData = {};
  @Input() activeDraggablePosition = { x: 0, y: 0 };
  @Input() mapWidthHeight = {};
  @Input() layerDisplayOptions: any = {};
  @Input() mapDivBlock;
  inBounds = true;

  private unSubscribe: Subject<void> = new Subject<void>();
  constructor(
    private layersService: LayersService,
    private placeFilterService: PlacesFiltersService,
    private cdRef: ChangeDetectorRef ) { }

  ngOnInit() {
    this.layersService.getApplyLayers().pipe(takeUntil(this.unSubscribe)).subscribe((value) => {
      if (value) {
        this.loadLogo();
      } else {
        this.removeLogo();
      }
    });
  }

  private loadLogo() {
    const layersSession = this.layersService.getlayersSession(true);
    let logoInformation = {};
    if (layersSession && layersSession['display'] && typeof layersSession['display']['isLogoEnabled'] !== 'undefined') {
      this.showCustomLogo = layersSession['display']['isLogoEnabled'];
    }
    if (this.layersService.customLogo['logo'] && this.layersService.customLogo['logo']['url']) {
      if (this.layersService.customLogo['logo']['url']) {
        logoInformation = this.layersService.customLogo['logo'];
      }
    } else if (layersSession && layersSession['display']) {
      if (layersSession['display']['logo'] && layersSession['display']['logo']['url']) {
        logoInformation = layersSession['display']['logo'];
      } else if (layersSession && layersSession['customLogoInfo'] &&
        layersSession['customLogoInfo']['logo'] && layersSession['customLogoInfo']['logo']['url']) {
        logoInformation = layersSession['customLogoInfo']['logo'];
      }
    }
    this.logoInfo = {
      url: logoInformation['url'],
      backgroundWhite: logoInformation['backgroundWhite']
    };
    if (logoInformation['position']) {
      this.logoStyle['top'] = logoInformation['position']['top'] + 'px';
      this.logoStyle['left'] = logoInformation['position']['left'] + 'px';
      this.logoStyle['width'] = logoInformation['size']['width'] + 'px';
      this.logoStyle['height'] = logoInformation['size']['height'] + 'px';
      this.activeDraggablePosition = {
        x: logoInformation['position']['left'],
        y: logoInformation['position']['top']
      };
    } else {
      this.logoStyle['width'] = '150px';
      setTimeout(() => {
        const element = document.getElementById('map-div-block');
        const logoElement = document.getElementById('customLogoElement');
        if ( element && logoElement) {
          const top = 10;
          const left = 10;
          this.logoStyle['top'] = top + 'px';
          this.logoStyle['left'] = left + 'px';
          this.logoStyle['height'] = logoElement.clientHeight + 'px';
          const height = logoElement.clientHeight;
          this.activeDraggablePosition = {
            x: top,
            y: left
          };
          if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
            this.layerDisplayOptions['logo'] = {};
          }
          this.layerDisplayOptions['logo']['position'] = {
            'top': top,
            'left': left
          };
          logoInformation['position'] = {
            'top': top,
            'left': left
          };
          logoInformation['size'] = {
            'width': 150,
            'height': height
          };
          this.layerDisplayOptions['logo']['size'] = {
            'width': 150,
            'height': height
          };
          if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
            this.layersService.customLogo['logo']['size'] = {
              'width': 150,
              'height': height
            };
            this.layersService.customLogo['logo']['position'] = {
              'top': top,
              'left': left
            };
          }
          if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
            layersSession['customLogoInfo']['logo']['size'] = {
              'width': 150,
              'height': height
            };
            layersSession['customLogoInfo']['logo']['position'] = {
              'top': top,
              'left': left
            };
          }
          layersSession['display'] = this.layerDisplayOptions;
          this.layersService.saveLayersSession(layersSession, true);
          this.layersService.setDisplayOptions(this.layerDisplayOptions);
          this.showDraggedLogo = false;
          setTimeout(() => {
            this.showDraggedLogo = true;
            this.addResizeIcon();
          }, 20);
        }
      }, 1000);
    }
    this.cdRef.markForCheck();
  }
  public editLogo() {
    this.placeFilterService.setFilterSidenav({ open: true, tab: 'layers' });
  }

  public onDragging(event) {
    this.resizingInProcess = true;
  }

  public onDragStop(event) {
    if (!this.enableDraggable) {
      return true;
    }
    const layersSession = this.layersService.getlayersSession(true);
    this.resizingInProcess = false;
    const activeDraggablePosition = JSON.parse(JSON.stringify(this.activeDraggablePosition));
    activeDraggablePosition['x'] += event['x'];
    activeDraggablePosition['y'] += event['y'];
    this.logoStyle['top'] = activeDraggablePosition['y'] + 'px';
    this.logoStyle['left'] = activeDraggablePosition['x'] + 'px';
    this.activeDraggablePosition = activeDraggablePosition;
    if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
      this.layerDisplayOptions['logo'] = {};
    }
    this.layerDisplayOptions['logo']['position'] = {
      'top': this.activeDraggablePosition['y'],
      'left': this.activeDraggablePosition['x']
    };
    if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
      this.layersService.customLogo['logo']['position'] = {
        'top': this.activeDraggablePosition['y'],
        'left': this.activeDraggablePosition['x']
      };
    }
    this.layerDisplayOptions['screen'] = this.mapWidthHeight;
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
    layersSession['display'] = this.layerDisplayOptions;
    if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
      layersSession['customLogoInfo']['logo']['position'] = {
        'top': this.activeDraggablePosition['y'],
        'left': this.activeDraggablePosition['x']
      };
    }
    this.layersService.saveLayersSession(layersSession, true);
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
    this.showDraggedLogo = false;
    setTimeout(() => {
      this.showDraggedLogo = true;
      this.addResizeIcon();
    }, 20);
  }

  public onResizing(event) {
    this.resizingInProcess = true;
  }

  public onResizeStop(event) {
    this.resizingInProcess = false;
    const layersSession = this.layersService.getlayersSession(true);
    this.logoStyle['width'] = `${event.size.width}px`;
    this.logoStyle['height'] = `${event.size.height}px`;
    if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
      this.layerDisplayOptions['logo'] = {};
    }
    this.layerDisplayOptions['logo']['size'] = {
      width: event.size.width,
      height: event.size.height
    };
    this.layersService.setDisplayOptions(this.layerDisplayOptions);
    layersSession['display'] = this.layerDisplayOptions;
    if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
      this.layersService.customLogo['logo']['size'] = {
        width: event.size.width,
        height: event.size.height
      };
    }
    if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
      layersSession['customLogoInfo']['logo']['size'] = {
        width: event.size.width,
        height: event.size.height
      };
    }
    this.layersService.saveLayersSession(layersSession, true);
  }

  public removeLogo() {
    this.layersService.setRemoveLogoAndText('logo');
    this.logoInfo = {};
    this.logoStyle = {};
    this.enableDraggable = true;
    this.activeDraggablePosition = { x: 0, y: 0 };
  }


  private addResizeIcon() {
    setTimeout(() => {
      const elements = document.getElementsByClassName('ng-resizable-se');
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          // tslint:disable-next-line: max-line-length
          elements[i].innerHTML = '<svg style="width:24px;height:24px" viewBox="0 0 24 24" class="extand-img"> <path fill="#000000" d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" /></svg>';
        }
      }
    }, 200);
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
