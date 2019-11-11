import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {CommonService} from '@shared/services/common.service';
import {ExploreDataService} from '@shared/services/explore-data.service';
import {FormatService} from '@shared/services/format.service';
import {PlacesService} from '@shared/services/places.service';
import {ThemeService} from '@shared/services/theme.service';
import {WorkSpaceDataService} from '@shared/services/work-space-data.service';
import {debounceTime, takeWhile, tap, map} from 'rxjs/operators';
import {PlacesFiltersService} from '../../../places/filters/places-filters.service';
import {LayersService} from '../layers.service';
import { ExploreService, InventoryService, AuthenticationService } from '@shared/services';

@Component({
  selector: 'app-explore-customize-layers',
  templateUrl: './explore-customize-layers.component.html',
  styleUrls: ['./explore-customize-layers.component.less']
})
export class ExploreCustomizeLayersComponent implements OnInit, OnDestroy {
  public filteredPlacePacks: any = [];
  public selectedValues = [];
  public selectedLayers: any = [];
  public keyCodes = {
    ENTER: 13,
    PREVENT: [17, 18],
    LEFTARROW: 37,
    UPARROW: 38,
    DOWNARROW: 40
  };
  public autocompletePlaces = [];
  public fetchingSuggestion = false;
  selectedSearchPlace = {};
  public unSubscribe = true;
  public searchPlaceCtrl: FormControl = new FormControl();
  public searchGeography: FormControl = new FormControl();
  public fetchingSingleSuggestion = false;
  public processing = true;
  public singleUnit: any = '';
  public singleUnitType = 'top_markets';
  public geoPanelIds = [];
  public selectedSingleUnit: number = null;
  public isSmallScreen = false;
  public inventorySets: any = [];
  map: any;
  public SelectedLayerColorPalet = '';
  private duplicateSelectedColorPalet = '';
  private themeSetting: any;
  private defaultPrimaryColor = '';
  private defaultSceondaryColor = '';
  public customIcons = ['icon-circle', 'icon-place', 'icon-circle-stroke', 'icon-star1', 'icon-square', 'icon-triangle', 'icon-street-view', 'icon-map-signs', 'icon-map-o', 'icon-map', 'icon-globe', 'icon-location-arrow','icon-thumb-tack', 'icon-bullseye', 'icon-circle-o','icon-neuter']; //,

  // 'icon-train', 'icon-car', 'icon-home', 'icon-bank', 'icon-store', 'icon-shopping', 'icon-shopping-2', 'icon-hotel', 'icon-bar', 'icon-restaurant', 'icon-gas', 'icon-warning'
  public fetchingGeography = false;
  public geographyData = [];
  public isGeographyAvailable = false;
  public isLayerPackage = false;
  public isInventorySetLoaded = false;
  public placeModulePermission: any;
  public inventorySetModulePermission: any;
  constructor(
    private formatService: FormatService,
    private route: ActivatedRoute,
    private place: PlacesService,
    private commonService: CommonService,
    private layersService: LayersService,
    private exploreDataService: ExploreDataService,
    private theme: ThemeService,
    private workSpaceDataService: WorkSpaceDataService,
    private placesFiltersService: PlacesFiltersService,
    private exploreService: ExploreService,
    private inventoryService: InventoryService,
    private auth: AuthenticationService,
  ) { }

  ngOnInit() {
    this.themeSetting = this.theme.getThemeSettings();
    this.defaultPrimaryColor = this.themeSetting['color_sets']['primary'] && this.themeSetting['color_sets']['primary']['base'];
    this.defaultSceondaryColor = this.themeSetting['color_sets']['secondary'] && this.themeSetting['color_sets']['secondary']['base'];
    this.placeModulePermission = this.auth.getModuleAccess('places');
    const exploreModulePermission = this.auth.getModuleAccess('explore');
    this.inventorySetModulePermission = exploreModulePermission['features']['inventorySet'];

    this.commonService.getMobileBreakPoint()
    .subscribe(isMobile => { this.isSmallScreen = isMobile; });
    const routeData = this.route.snapshot.data;
    /* if (routeData.places && routeData.places['data']) {
      this.filteredPlacePacks = routeData.places['data'];
      this.filteredPlacePacks.sort(this.formatService.sortAlphabetic);
    } */


    /* if (routeData.packages && routeData.packages['packages']) {
      this.inventorySets = routeData.packages.packages;
      this.inventorySets.sort(this.formatService.sortAlphabetic);
    } */
    this.loadFromSession();
    // this.exploreDataService.onMapLoad().pipe(takeWhile(() => this.unSubscribe)).subscribe(() => {
    //   console.log('setApplyLayers 2');
    //   this.layersService.setApplyLayers(true);
    // });
    this.searchPlaceCtrl.valueChanges
    .pipe(takeWhile(() => this.unSubscribe),
    debounceTime(200))
    .subscribe(() => {
      this.autocompletePlace();
    });
    this.searchGeography.valueChanges
    .pipe(takeWhile(() => this.unSubscribe),
    debounceTime(200))
      .subscribe((value) => {
      this.autocompleteGeography(value);
    });
    this.isInventorySetLoaded = false;
    this.workSpaceDataService
      .getPackages()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(packages => {
        const inventorySets = packages.sort(this.formatService.sortAlphabetic);
        this.inventorySets = JSON.parse(JSON.stringify(inventorySets));
        this.isInventorySetLoaded = true;
        this.loadSearchResultLayer();
        this.loadFromSession();
      });
    this.layersService.getApplyLayers().subscribe((value) => {
      if (!value) {
        this.layersService.cleanUpMap(this.map);
        this.removeLayers();
      } else {
        this.loadFromSession();
      }
    });

    this.exploreDataService.getMapObject().subscribe(mapObject => {
        this.map = mapObject;
    });
    this.place.getPlacesSet()
    .pipe(map(data => data['data']))
    .subscribe(data => {
      this.filteredPlacePacks = data;
      this.filteredPlacePacks.sort(this.formatService.sortAlphabetic);
    });
    this.layersService.onPushSearchResultLayer()
    .subscribe(value => {
      const layersSession = this.layersService.getlayersSession();
      this.isLayerPackage = value;
      this.loadSearchResultLayer();
      if (!value) {
        this.inventorySets = this.inventorySets.filter(layer => layer['_id'] !== 'default');
        this.selectedLayers = this.selectedLayers.filter(layer => layer['id'] !== 'default');
        if (layersSession) {
          this.layersService.saveLayersSession({
            selectedLayers: layersSession['selectedLayers'].filter( (layer) => layer['id'] !== 'default')
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.unSubscribe = false;
  }

  loadSearchResultLayer() {
    const layersSession = this.layersService.getlayersSession();
    let searchLayer = null;
    if (this.isInventorySetLoaded && this.isLayerPackage) {
      const defaultLayer = this.inventorySets.find((layer) => layer['_id'] === 'default');
      if (!defaultLayer) {
        const data = {'_id': 'default', 'name': 'Search Results'};
        this.inventorySets.unshift(data);
        if (layersSession !== null) {
          const selected = layersSession.selectedLayers;
          searchLayer = selected.find((d) => d['id'] === 'default');
        }
        const removedLayer = this.layersService.getRemovedSearchLayer();
        if ((searchLayer === null || !searchLayer) && (removedLayer === null || !removedLayer)) {
          this.moveLayer(data, 'inventory collection', 0);
          this.layersService.setRemovedSearchLayer(false);
          const selectedLayers = [{
            'data': data,
            'type': 'inventory collection',
            'id': 'default',
            'icon': 'icon-wink-pb-dig',
            'color': this.defaultPrimaryColor
          }];
          this.layersService.saveLayersSession({
            selectedLayers: selectedLayers
          });
        }
      }
    }
  }
  /**
   *
   * @param layer
   * @param type
   * @param position
   * This function is used to move a layer to selected array.
   */
  public moveLayer(layer, type, position) {
    this.SelectedLayerColorPalet = '';
    switch (type) {
      case 'inventory collection':
        let icon = 'icon-circle';
        if (layer['_id'] === 'default') {
          icon = 'icon-wink-pb-dig';
        }
        this.selectedLayers.push({data: layer, type: type, id: layer._id,  icon: icon, color: this.defaultPrimaryColor});
        this.inventorySets[position]['selected'] = true;
        this.updateSelecetedLayers();
      break;
      case 'place collection':
        // have removed layer and made as empty
        this.selectedLayers.push({data: layer, type: type, id: layer._id, icon: 'icon-place', color: this.defaultPrimaryColor});
        this.filteredPlacePacks[position]['selected'] = true;
        this.updateSelecetedLayers();
      break;
      case 'place':
        layer['geometry'] = layer['properties']['point'];
        this.selectedLayers.push({
          data: layer,
          type: type,
          id: layer.properties.safegraph_place_id,
          icon: 'icon-place',
          color: this.defaultSceondaryColor
        });
        this.autocompletePlaces[position]['selected'] = true;
        this.updateSelecetedLayers();
      break;
      case 'geopathId':
        this.selectedLayers.push({
          data: layer,
          type: type,
          id: layer.toString(),
          icon: 'icon-circle-stroke',
          color: this.defaultPrimaryColor,
          heatMapType: this.singleUnitType,
        });
        this.selectedSingleUnit = layer;
        this.updateSelecetedLayers();
        break;
      case 'geography':
      this.geographyData[position['key']][position['index']]['selected'] = true;
        this.exploreService.getmarketGeometry({id: layer.id, type: position['key']})
        .subscribe(
          response => {
            response['name'] = layer.name;
            this.selectedLayers.push({
              data: response,
              type: type,
              id: layer.id.toString(),
              icon: 'icon-circle',
              color: this.defaultPrimaryColor,
              geography: position['key'],
            });
            this.geographyData[position['key']][position['index']]['selected'] = true;
            this.updateSelecetedLayers();
          },
          error => {
            this.geographyData[position['key']][position['index']]['selected'] = false;
          }
        );
      break;
    }

  }

  /**
   *
   * @param layer
   * @param type
   * @param position
   * This function is used to remove selected layer.
   */
  public removeLayer(layer , type, position) {
    switch (type) {
      case 'inventory collection':
      const selectedInventoryIndex = this.inventorySets.findIndex(item => item._id === layer._id);
      if (selectedInventoryIndex >= 0 && selectedInventoryIndex !== undefined) {
        this.inventorySets[selectedInventoryIndex]['selected'] = false;
      }
      this.selectedLayers.splice(position, 1);
      this.updateSelecetedLayers();
      break;
      case 'place collection':
      const selectedPlaceIndex = this.filteredPlacePacks.findIndex(item => item._id === layer._id);
      if (selectedPlaceIndex >= 0 && selectedPlaceIndex !== undefined) {
        this.filteredPlacePacks[selectedPlaceIndex]['selected'] = false;
      }
      this.selectedLayers.splice(position, 1);
      this.updateSelecetedLayers();
      break;
      case 'place':
        const singlePlaceIndex = this.autocompletePlaces.findIndex(item =>
           item.properties.safegraph_place_id === layer.properties.safegraph_place_id);
        if (singlePlaceIndex >= 0 && singlePlaceIndex !== undefined) {
          this.autocompletePlaces[singlePlaceIndex]['selected'] = false;
        }
        this.selectedLayers.splice(position, 1);
        this.updateSelecetedLayers();
      break;
      case 'geopathId':
        const selectedGPIdIndex = this.selectedLayers.findIndex(item => item.id === layer.toString());
        this.selectedLayers.splice(selectedGPIdIndex, 1);
        this.updateSelecetedLayers();
        this.selectedSingleUnit = null;
      break;
      case 'geography':
        if (this.geographyData && Object.keys(this.geographyData).length > 0) {
          this.geographyData[this.selectedLayers[position]['geography']].map( element => {
            if (element.id === Number(layer.id)) {
              element['selected'] = false;
            }
          });
        }
        this.selectedLayers.splice(position, 1);
        this.updateSelecetedLayers();
      break;
    }
  }

  /**
   *
   * This function is used to list places
   */
  private autocompletePlace() {
    const value = this.searchPlaceCtrl.value;
    const keyword = 'keyword';
    if (value && value.length >= 3) {
      this.fetchingSuggestion = true;
        const formValues = {};
        formValues['search'] = value;
        const bounds = this.commonService.getMapBoundingBox(this.map);
        formValues['bounds'] = bounds['coordinates'][0][0];
        formValues['autocomplete'] = true;
        this.placesFiltersService.getPOISuggestion(value, keyword, true).subscribe(response => {
          if (typeof response['data']['places'] !== 'undefined') {
            this.autocompletePlaces = response['data']['places'];
              this.selectedLayers.forEach(layers => {
              const singlePlaceIndex = response['data']['places'].findIndex(item => item.properties.safegraph_place_id === layers.id);
                if (singlePlaceIndex >= 0 && singlePlaceIndex !== undefined) {
                  this.autocompletePlaces[singlePlaceIndex]['selected'] = true;
                }
             });
          }
          this.fetchingSuggestion = false;
        },
        error => {
          this.fetchingSuggestion = false;
          this.autocompletePlaces = [];
        });
    }
  }
  /**
 * This fuction is used to get the geography based on search input
 */
  autocompleteGeography(value) {
    if (value && value.length >= 3) {
      this.fetchingGeography = true;
      this.exploreService.getmarketSearch(value, true)
      .subscribe(
        response => {
          this.fetchingGeography = false;
          this.geographyData = response;
          let issearchdata = false;
          const selectedGeoRegions = this.selectedLayers.filter( layer => (layer.type === 'geography' ));
          for (const key in this.geographyData) {
            if (this.geographyData[key] != null && this.geographyData[key].length) {
              issearchdata = true;
            }
          }
          if (issearchdata) {
            this.isGeographyAvailable = true;
            selectedGeoRegions.forEach(layer => {
              if (layer !== null) {
                const index = this.geographyData[layer['geography']].findIndex(data => data.id === Number(layer.id));
                if (index >= 0 && index !== undefined) {
                  this.geographyData[layer['geography']][index]['selected'] = true;
                }
              }
            });
          } else {
            this.isGeographyAvailable = false;
          }
        });
    }
  }
  private updateSelecetedLayers() {
    this.layersService.setLayers(this.selectedLayers);
    // this.layersService.saveLayersSession({selectedLayers: this.selectedLayers});
  }
  private removeLayers() {
    this.selectedLayers = [];
    this.autocompletePlaces = [];
    this.searchPlaceCtrl.reset();
    this.layersService.setLayers(this.selectedLayers);
    this.filteredPlacePacks.map(pack => pack['selected'] = false);
    this.autocompletePlaces.map(pack => pack['selected'] = false);
    this.inventorySets.map(pack => pack['selected'] = false);
    this.layersService.saveLayersSession({selectedLayers: []});
    this.selectedSingleUnit = null;
    this.geographyData = [];
    this.searchGeography.reset();
  }
  private loadFromSession() {
    const layersSession = this.layersService.getlayersSession();
    this.selectedLayers = [];
    this.autocompletePlaces = [];
    this.searchPlaceCtrl.reset();
    if (layersSession && layersSession['selectedLayers'] && layersSession.selectedLayers.length > 0) {
      this.selectedLayers = layersSession.selectedLayers;
      this.layersService.setLayers(this.selectedLayers);
      this.inventorySets.map(val => val.selected = false );
      this.filteredPlacePacks.map(val => val.selected = false );
      this.selectedLayers.map((layer) => {
        switch (layer.type) {
          case 'inventory collection':
            if (!layer['color'] && !layer['icon']) {
              layer['icon'] = 'icon-circle';
              layer['color'] = this.defaultPrimaryColor;
            }
            const setIndex = this.inventorySets.findIndex(pack => pack._id === layer.id);
            if (setIndex >= 0) {
              this.inventorySets[setIndex]['selected'] = true;
            }
          break;
          case 'place collection':
            if (!layer['color'] && !layer['icon']) {
              layer['icon'] = 'place';
              layer['color'] = this.defaultPrimaryColor;
            }
            const index = this.filteredPlacePacks.findIndex(pack => pack._id === layer.id);
            if (index >= 0) {
              this.filteredPlacePacks[index]['selected'] = true;
            }
          break;
          case 'place':
            if (!layer['color'] && !layer['icon']) {
              layer['icon'] = 'place';
              layer['color'] = this.defaultSceondaryColor;
            }
            this.autocompletePlaces.push(layer.data);
          break;
          case 'geopathId':
            layer['data'] = layer['id'];
            this.selectedSingleUnit = layer['data'];
            break;
          case 'geography':
            if (!layer['color'] && !layer['icon']) {
              layer['icon'] = 'icon-circle';
              layer['color'] = this.defaultPrimaryColor;
            }
            layer['selected'] = true;
            layer['data']['name'] = layer['data']['properties']['name'];
          break;
        }
      });
    }
  }
  openColorPalet(layerID) {
    if (this.SelectedLayerColorPalet === layerID) {
      this.SelectedLayerColorPalet = '';
    } else {
      this.SelectedLayerColorPalet = layerID;
    }
  }
  onAppColorChange(layer, color, type, icon = 'icon-place') {
    const selectedPlaceIndex = this.selectedLayers.findIndex(item => item.id === layer.id);
    if (selectedPlaceIndex >= 0 && selectedPlaceIndex !== undefined) {
      this.selectedLayers[selectedPlaceIndex]['icon'] = icon;
      this.selectedLayers[selectedPlaceIndex]['color'] = color;
    }
    this.updateSelecetedLayers();
  }
  onDragStart(event) {
    if (this.SelectedLayerColorPalet !== '') {
      this.duplicateSelectedColorPalet = this.SelectedLayerColorPalet;
      this.SelectedLayerColorPalet = '';
    }
  }
  onDragEnd(event) {
    this.SelectedLayerColorPalet = this.duplicateSelectedColorPalet;
    this.duplicateSelectedColorPalet = '';
  }
  onClose(event) {
    if (event) {
      this.SelectedLayerColorPalet = '';
    }
  }
  public onSingleUnitSearch() {
    // commented on 17-07-2019 due to removal autocomplete function intemx api
   /*if (!(this.singleUnit.length >= 4)) {
      return false;
    }
    this.fetchingSingleSuggestion = true;
    this.layersService
      .geoPanelAutoComplete(this.singleUnit, true)
      .pipe(tap(res => {
        this.fetchingSingleSuggestion = false;
      })).subscribe(response => {
      this.geoPanelIds = response['geopathPanelList'];
      if (this.geoPanelIds.length <= 0) {
        this.processing = false;
      }
    }, error => {
      console.log(error);
    });*/

    if (this.singleUnit.trim().length >= 1) {
      this.processing = true;
      this.fetchingSingleSuggestion = true;
      this.inventoryService.
      searchInventoryById(this.singleUnit.trim()).subscribe(respose => {
        this.fetchingSingleSuggestion = false;
        this.processing = false;
        if (respose && respose.id === Number(this.singleUnit.trim())) {
          this.geoPanelIds = [this.singleUnit.trim()];
        } else {
          this.geoPanelIds = [];
        }
      }, error => {
        this.fetchingSingleSuggestion = false;
        this.processing = false;
        this.geoPanelIds = [];
        console.log('error', error);
      });
    }
  }
  public layer($event) {
    if ($event.type === 'place') {
      this.autocompletePlaces = $event.autocompletePlaces;
    }
    if ($event.type === 'geography') {
      this.geographyData = $event.geographyData;
    }
    this.moveLayer($event.layer, $event.type, $event.position);
  }
}
