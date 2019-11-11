import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FilterPillTypes} from '@interTypes/displayOptions';
import { SavedViewDialogComponent } from '../../../shared/components/saved-view-dialog/saved-view-dialog.component';
import { LayersService } from '../layers.service';
import { ExploreService } from '../../../shared/services/explore.service';
import { ExploreDataService } from '../../../shared/services/explore-data.service';
import { takeWhile } from 'rxjs/operators';
import { FiltersService } from '../../filters/filters.service';
import { PlacesService } from '../../../shared/services/places.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { ThemeService } from '@shared/services';
@Component({
  selector: 'app-explore-layers',
  templateUrl: './explore-layers.component.html',
  styleUrls: ['./explore-layers.component.less']
})
export class ExploreLayersComponent implements OnInit, OnDestroy {
  private layers: any = [];
  private layersAll: any = [];
  private layerDisplayOptions: any = {};
  public selectedView: any;
  public tabSelectedIndex: any = 0;
  public unSubscribe = true;
  public isLoadView = false;
  placeSets = [];
  private layerData = {};
  mod_permission: any;
  allowInventory: any = '';
  allowInventoryAudience: any = '';
  audienceLicense = {};
  // private noRepeat = true;
  private themeSettings: any;
  private mapStyle: string;
  constructor(
    public dialog: MatDialog,
    private exploreService: ExploreService,
    private layersService: LayersService,
    private route: ActivatedRoute,
    private filterService: FiltersService,
    private place: PlacesService,
    private exploreDataService: ExploreDataService,
    private authentication: AuthenticationService,
    private theme: ThemeService,
    ) { }

  public ngOnInit() {
    this.themeSettings = this.theme.getThemeSettings();
    this.themeSettings.basemaps.filter(maps => {
        if (maps.default) {
          this.mapStyle = maps.label;
        }
    });
    this.mod_permission = this.authentication.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.authentication.getModuleAccess('gpAudience');
    this.allowInventoryAudience = this.audienceLicense['status'];
    const routeData = this.route.snapshot.data;
    if (routeData.places && routeData.places['places']) {
      this.placeSets = routeData.places.places;
    }
    this.layersService.getLayers().subscribe((layers) => {
      if (layers) {
        this.layers = layers;
      }
    });
    this.layersService.getDisplayOptions().subscribe((displayOptions) => {
      this.layerDisplayOptions = displayOptions;
    });
    this.layersService.getSelectedView().subscribe((data) => {
      this.selectedView = data;
      /* Actually these lines are not needed
       ticket - https://intermx.atlassian.net/browse/IMXUIPRD-265  commented date - 23/05/2019 */
      // if (this.selectedView && this.noRepeat) {
      //   this.loadLayers();
      //   this.noRepeat = false;
      // }
    });
    this.exploreService.getSavedLayers()
    .pipe(takeWhile(() => this.unSubscribe))
    .subscribe((layer) => {
      this.layersAll  = layer;
    });
    this.layersService.getLoadView().pipe(takeWhile(() => this.unSubscribe))
    .subscribe(value => {
      if (value) {
        this.loadLayers();
        // this.isLoadView = true;
        // this.onApply();
      }
      //  else {
      //   this.isLoadView = false;
      // }
    });
    this.layersService.getSaveView().pipe(takeWhile(() => this.unSubscribe))
    .subscribe(value => {
      if (value) {
        this.onSaveView();
      }
    });
    this.exploreDataService.onMapLoad().pipe(takeWhile(() => this.unSubscribe)).subscribe(() => {
      this.layersService.setApplyLayers(true);
    });

  }
  ngOnDestroy() {
    this.unSubscribe = false;
  }
  public onSaveView() {
   const data = {};
   data['layers'] = this.layers;
   data['layersAll'] = this.layersAll;
   data['display'] = this.layerDisplayOptions;
   if (data['display']['baseMap'] === '') {
    data['display']['baseMap'] = this.mapStyle;
   }
   const filters = this.filterService.getExploreSession();
   data['filters'] = filters;
   data['method'] = 'add';
   const dialogRef = this.dialog.open(SavedViewDialogComponent, {
      width: '500px',
      data: data,
      panelClass: 'save-layer-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  public onUpdateView() {
    this.exploreService
      .getLayerView(this.selectedView, true)
      .subscribe(layerDetails => {
        const data = {};
        data['layers'] = this.layers;
        data['layersAll'] = this.layersAll;
        data['display'] = this.layerDisplayOptions;
        const filters = this.filterService.getExploreSession();
        data['filters'] = filters;
        data['method'] = 'update';
        data['selectedView'] = layerDetails;
        const dialogRef = this.dialog.open(SavedViewDialogComponent, {
          width: '500px',
          data: data,
          panelClass: 'save-layer-dialog'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        });

      });
   }
  public onApply() {
    this.layersService.tabSelection = this.tabSelectedIndex;
    if (this.tabSelectedIndex !== 2) {
      if (this.layersService.customLogo['logo'] && Object.keys(this.layersService.customLogo['logo']).length > 0) {
        if (this.layerDisplayOptions['logo']) {
        this.layerDisplayOptions['logo']['backgroundWhite'] = this.layersService.customLogo['logo']['backgroundWhite'];
        }
      }
      const searchLayer = this.layers.filter((d) => d['id'] === 'default');

      if (this.layersService.getRemovedSearchLayer() !== null) {
        if (searchLayer && searchLayer.length > 0) {
          this.layersService.setRemovedSearchLayer(false);
        } else {
          this.layersService.setRemovedSearchLayer(true);
        }
      }
      this.layersService.saveLayersSession({
        selectedLayers: this.layers,
        display: this.layerDisplayOptions,
        selectedView: this.selectedView,
        customLogoInfo: this.layersService.customLogo
      });
      this.layersService.setApplyLayers(true);
    } else {
      this.loadLayers();
    }
  }
  private loadLayers () {
    this.layerData = {};
      if (this.selectedView) {
        this.exploreService
            .getLayerView(this.selectedView, true)
            .subscribe(layerDetails => {
              let display = {};
              let layers = [];
              if (layerDetails['display']) {
                display = layerDetails['display'];
              }
              if (!display['filterPills'] && !display['labels']) {
                display['filterPills'] = false;
                display['labels'] = {
                  audience: true,
                  market: true,
                  filters: true,
                  'saved view': true,
                };
              }
              if (layerDetails['layers'] && layerDetails['layers'].length > 0) {
                layers = layerDetails['layers'];
              }
              if (display['logo']) {
                this.layersService.customLogo['logo'] = display['logo'];
              }
              this.layersService.setDisplayOptions(display);
              this.layersService.setLayers(layers);
              this.layersService.saveLayersSession({selectedLayers: layers, display: display, selectedView: this.selectedView});
              this.layersService.setApplyLayers(true);
              if (layerDetails['filters']) {
                this.filterService.resetAll();
                setTimeout(() => {
                  this.filterService.saveExploreSession(layerDetails['filters']);
                  this.filterService.setFilterFromView(layerDetails['filters']);
                  const pill = `Saved View:  ${layerDetails.name}`;
                  this.filterService.setFilterPill('saved view', pill);
                }, 500);
              }
            });
      } else {
        this.filterService.removeFilterPill('saved view');
      }
  }
  public clearAll() {
    this.layersService.setApplyLayers(false);
    this.layersService.setLoadView(false);
  }
  tabchange(event) {
    this.tabSelectedIndex = event;
  }
}
