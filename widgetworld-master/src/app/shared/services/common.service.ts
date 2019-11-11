import { InventorySpot } from './../../Interfaces/inventory';
import { Injectable } from '@angular/core';
import {WorkflowLables} from '@interTypes/workspaceV2';

import { BehaviorSubject, Subject, Observable } from 'rxjs';
import swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';
import {ThemeService} from './theme.service';
import { AuthenticationService } from './authentication.service';
import { SpotReference, Measure, Representation } from '@interTypes/inventorySearch';
import { CustomizedSpot } from '@interTypes/inventory';
import { FormatService } from './format.service';
import { Orientation } from 'app/classes/orientation';

@Injectable({providedIn: 'root'})
export class CommonService {
  public homeClicked = new Subject();
  private breadcrumbs = new BehaviorSubject([]);
  private workSpaceURL = new BehaviorSubject('');
  private mobileBreakPoint = new BehaviorSubject('');
  locateRedirectURL = 'https://support.geopath.io/hc/en-us/articles/360004970151-Locate-Me-not-working-';
  private dropdownState = new Subject();
  private styles = [];
  private mediaTypes;
  private classificationTypes = [];
  public subProjects: any[];
  public subProjectAccess: any;
  constructor(
    private theme: ThemeService,
    private auth: AuthenticationService,
    private formatService: FormatService
  ) {
  }
  public currentUrl: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  updateCurrentUrl(value: string) {
    this.currentUrl.next(value);
  }


  /**
   * Returns static styles data for mapbox
   * @returns {any[]}
   */
  public getStylesData(color = '') {
    const themeSettings = this.theme.getThemeSettings();
    if (themeSettings) {
      this.styles = [
        // ACTIVE (being drawn)
        // line stroke
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'draw_polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': color !== '' ? color : themeSettings.color_sets.highlight.base,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // polygon fill
        {
          'id': 'gl-draw-polygon-fill',
          'type': 'fill',
          'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'draw_polygon']],
          'paint': {
            'fill-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'fill-outline-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'fill-opacity': 0.01
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'draw_polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // vertex point halos
        {
          'id': 'gl-draw-polygon-and-line-vertex-halo-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'draw_polygon']],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          'id': 'gl-draw-polygon-and-line-vertex-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'draw_polygon']],
          'paint': {
            'circle-radius': 3,
            'circle-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
          }
        },

        // INACTIVE (static, already drawn)
        // line stroke
        {
          'id': 'gl-draw-line-static',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'draw_polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // polygon fill
        {
          'id': 'gl-draw-polygon-fill-static',
          'type': 'fill',
          'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'draw_polygon']],
          'paint': {
            'fill-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'fill-outline-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'fill-opacity': 0.01
          }
        },
        // polygon outline
        {
          'id': 'gl-draw-polygon-stroke-static',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'draw_polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color':  color !== '' ? color : themeSettings.color_sets.highlight.base,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },

        // static mode polygon
        // fill color
        {
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'fill-color': [
              'case',
              ['==', ['get', 'user_areaType'], 'building'], '#2196F3',
              ['==', ['get', 'user_areaType'], 'property'], '#DD6666',
              themeSettings.color_sets.highlight.base
            ],
            'fill-outline-color': [
              'case',
              ['==', ['get', 'user_areaType'], 'building'], '#2196F3',
              ['==', ['get', 'user_areaType'], 'property'], '#DD6666',
              themeSettings.color_sets.highlight.base
            ],
            // 'fill-color': themeSettings.color_sets.highlight.base,
            // 'fill-outline-color': themeSettings.color_sets.highlight.base,
            'fill-opacity': 0.5
          }
        },
        // polygon outline
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': [
              'case',
              ['==', ['get', 'user_areaType'], 'building'], '#2196F3',
              ['==', ['get', 'user_areaType'], 'property'], '#DD6666',
              themeSettings.color_sets.highlight.base
            ],
            'line-width': 2
          }
        },
      ];
    }
    return this.styles;
  }
  public isMobile() {
    return (/iphone|ipod|android|ie|blackberry|fennec/)
      .test(navigator.userAgent.toLowerCase());
  }

  validateFormGroup(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({
          onlySelf: true
        });
      } else if (control instanceof FormGroup) {
        this.validateFormGroup(control);
      }
    });
  }

  confirmExit(form: FormGroup,
    message: string = 'Your changes to this project have not been saved. Do you want to leave without saving?',
    title: string = 'Are you sure?',
    primaryText: string = 'Yes, Leave This Page',
    secondaryText: string = 'No, Stay on This Page'
  ) {
    if (form.dirty) {
      return new Promise((resolve, reject) => {
        swal({
          title: title,
          text: message,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: primaryText,
          cancelButtonText: secondaryText,
          confirmButtonClass: 'waves-effect waves-light',
          cancelButtonClass: 'waves-effect waves-light'
        }).then(result => {
          if (result.value) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    } else {
      return true;
    }
  }
  public getBreadcrumbs(): Observable<any> {
    return this.breadcrumbs.asObservable();
  }
  public setBreadcrumbs(val) {
    return this.breadcrumbs.next(val);
  }
  // Commented on 09/04/2019 due to not used
  /*
  public findMarketByID(id) {
    const markets = JSON.parse(localStorage.getItem('markets'));
    if (markets) {
      const found = markets.find(function (market) {
        return market.id === id;
      });
      if (typeof found !== 'undefined') {
        return found['name'];
      } else {
        return '';
      }
      return '';
    }
  }*/
  getMapBoundingBox(map) {
    const lat = map.getBounds();
    const multiPolygon = {
      type: 'MultiPolygon',
      coordinates: [[]]
    };
    const bound = [];
    bound.push(lat.getSouthWest().toArray());
    bound.push(lat.getNorthEast().toArray());
    // bound.push(lat.getNorthWest().toArray());
    // bound.push(lat.getSouthEast().toArray());
    // bound.push(lat.getNorthEast().toArray());
    multiPolygon.coordinates[0].push(bound);
    return multiPolygon;
  }
  loadLocateMe() {
    const self = this;
    if ($('.mapboxgl-ctrl-locate').length > 0) {
      $('.mapboxgl-ctrl-locate').off().on('click',
        function (e) {
          if ($('.mapboxgl-ctrl-locate').hasClass('mapboxgl-ctrl-locate-active')) {
            $('.mapboxgl-ctrl-geolocate').click();
            $('.mapboxgl-ctrl-locate').removeClass('mapboxgl-ctrl-geolocate-waiting');
            $('.mapboxgl-ctrl-locate').removeClass('mapboxgl-ctrl-locate-active');
            setTimeout(function () {
              let cls = $('.mapboxgl-ctrl-geolocate').attr('class');
              cls = cls.replace('mapboxgl-ctrl-geolocate', 'mapboxgl-ctrl-locate');
              cls = cls.replace('mapboxgl-ctrl-geolocate-active', 'mapboxgl-ctrl-locate-active');
              cls = cls.replace('mapboxgl-ctrl-geolocate-waiting', '');
              $('.mapboxgl-ctrl-locate').attr('class', cls);
            }, 500);
          } else {
            $('.mapboxgl-ctrl-locate').addClass('mapboxgl-ctrl-geolocate-waiting');
            self.navigateToCurrentLocation();
          }
          return false;
        });
    }
  }
  navigateToCurrentLocation() {
    const self = this;
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(function (position) {
        $('.mapboxgl-ctrl-geolocate').click();
        setTimeout(function () {
          let cls = $('.mapboxgl-ctrl-geolocate').attr('class');
          cls = cls.replace('mapboxgl-ctrl-geolocate', 'mapboxgl-ctrl-locate');
          cls = cls.replace('mapboxgl-ctrl-geolocate-active', 'mapboxgl-ctrl-locate-active');
          cls = cls.replace('mapboxgl-ctrl-geolocate-waiting', '');
          $('.mapboxgl-ctrl-locate').attr('class', cls);
        }, 500);

      }, function (error) {
        self.showNavigationAlert();
      });
    } else {
      self.showNavigationAlert();
    }
  }
  showNavigationAlert() {
    $('.mapboxgl-ctrl-locate').removeClass('mapboxgl-ctrl-geolocate-waiting');
    swal(
      {
        title: 'Your browser location settings don\'t allow location discovery.',
        html: 'Click <a href=\'' + this.locateRedirectURL + '\' target=\'blank\'>here</a> to correct this.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'CORRECT THIS ISSUE',
        cancelButtonText: 'CLOSE',
        confirmButtonClass: 'waves-effect waves-light',
        cancelButtonClass: 'waves-effect waves-light'
      }).then((x) => {
        if (typeof x.value !== 'undefined' && x.value) {
          window.open(this.locateRedirectURL, '_blank');
        }
      });
  }
  public getWorkSpaceState(): Observable<any> {
    return this.workSpaceURL.asObservable();
  }
  public setWorkSpaceState(url) {
    this.workSpaceURL.next(url);
    this.saveWorkSpaceSession({ redirectUrl: url });
  }
  saveWorkSpaceSession(session) {
    localStorage.setItem('workSpaceSession', JSON.stringify(session));
  }
  getWorkSpaceSession() {
    return JSON.parse(localStorage.getItem('workSpaceSession'));
  }
  getRedirectUrl() {
    const workSpaceSession = this.getWorkSpaceSession();
    if (workSpaceSession) {
      return workSpaceSession.redirectUrl;
    } else {
      return '';
    }
  }
  public getMobileBreakPoint(): Observable<any> {
    return this.mobileBreakPoint.asObservable();
  }
  public setMobileBreakPoint(isMobileBreakPoint) {
    this.mobileBreakPoint.next(isMobileBreakPoint);
  }

  truncateString(value, length = 10, addDots = false) {
    if (!value) {
      return '';
    }
    if (value && (value.length > (length * 2))) {
      let truncateFirstStr;
      let truncateLastStr;
      truncateFirstStr = value.substring(0, length);
      truncateLastStr = value.substring(value.length - length);
      truncateFirstStr += ' ... ';
      truncateFirstStr += truncateLastStr;
      if (!addDots) {
        return value.substring(0, length);
      }
      return truncateFirstStr;
    }
    return value;
  }
  checkValid(key, data) {
    if (typeof data[key] !== 'undefined' && data[key] != null && data[key] > 0) {
      return true;
    }
    return false;
  }

  getMapStyle(baseMaps, mapStyle) {
    let style = {};
    if (mapStyle) {
      style = baseMaps.find((map) => mapStyle === map.label);
    } else {
      style = baseMaps.find((map) => (map.default));
    }
    return style;
  }
  /**
  * angular dropdown Observable
  * if true will open dropdown else close
  */
  public getDropdownState(): Observable<any> {
    return this.dropdownState.asObservable();
  }
  public setDropdownState(state) {
    this.dropdownState.next(state);
  }
  prepareBreadcrumbs(project) {
    const access = this.auth.getModuleAccess('projects');
    this.subProjects = [];
    this.subProjectAccess = access['subProjects'];
    const parents = JSON.parse(localStorage.getItem('projectParents'));
    let pid = project['_id'] || project['id'];
    const projects = [];
    if (parents) {
      while (pid !== '') {
        const value = parents.filter(p => p.pid === pid);
        parents.splice(parents.findIndex(v => v.pid === pid), 1);
        if (value && value.length > 0) {
          pid = value[0].parentId;
          projects.push(value[0]);
        } else {
          pid = '';
        }
      }
    }
    const breadCrumbs = [
      {label: 'WORKSPACE', url: '/v2/projects/lists'}
    ];
    if (projects.length > 0) {
      for (let i = projects.length - 1; i >= 0; i--) {
        let url = '';
        // This condition to hide 2 level sub-project(Brand) for OMG
        if (!((this.subProjectAccess && this.subProjectAccess['layout'] === 'simple')  && projects.length >= 2 && i === 0)) {
          url = '/v2/projects/' + projects[i].parentId;
          breadCrumbs.push({label: projects[i].parentName, url: url});
        }
      }
    }
    breadCrumbs.push({label: project['name'], url: '/v2/projects/' + (project['_id'] || project['id'])});
    return {projects: projects, breadCrumbs: breadCrumbs};
  }
  setMediaTypes(medias) {
    this.mediaTypes = medias;
  }
  getMediaTypes() {
    return this.mediaTypes;
  }
  setClassificationTypes(medias) {
    this.classificationTypes = medias;
  }
  getClassificationTypes() {
    return this.classificationTypes;
  }
  getWorkFlowLabels(): WorkflowLables {
    let labels: WorkflowLables = {
      project: ['Project', 'Projects'],
      scenario: ['Scenario', 'Scenarios'],
      subProject: ['Sub Project', 'Sub Projects'],
      folder: ['Folder', 'Folders'],
    };
    const theme = this.theme.getThemeSettings();
    if (theme && theme['workflow']) {
      const workflow = theme['workflow'];
      labels = {
        project: workflow['project'],
        scenario: workflow['scenario_0'],
        subProject: workflow['sub-project'],
        folder: workflow['folder_0'],
      };
    }
    return labels;
  }

  /**
   * This function used to format the spot id details
   * Data is API response data
   */

   public async formatSpotsMeasures(data, tabularView = false) {
    const spots = [];
    const orientation = new Orientation();
    if (tabularView) {
      data.forEach(frame => {
        const spotsInFrame = frame.spot_references.map((spot: InventorySpot) => {
          spot['measures']['frame_id'] = frame['frame_id'];
          spot['measures']['plant_frame_id'] = frame['plant_frame_id'];
          spot['measures']['plant_operator'] = this.getOperatorName(frame['representations']);
          spot['measures']['spot_id'] = spot['spot_id'];
          spot['measures']['media_type'] = frame['media_type']['name'];
          spot['measures']['media_name'] = frame['media_name'];
          const formattedSpot: InventorySpot = {
            classification_type: frame['classification_type'],
            construction_type: frame['construction_type'],
            digital: frame['digital'] && frame['digital'] || '',
            geometry: frame['location'],
            illumination_type: frame['illumination_type'],
            max_height: frame['max_height'] &&
            this.formatService.sanitizeString(this.formatService.getFeetInches(frame['max_height'])) || '',
            max_width: frame['max_width'] && this.formatService.sanitizeString(this.formatService.getFeetInches(frame['max_width'])) || '',
            properties: spot['measures'],
          };
          formattedSpot['geometry']['orientation'] =  frame['location']['orientation'] !== 'undefined' && frame['location']['orientation'] !== '' && orientation.getOrientation(frame['location']['orientation']);
          return formattedSpot;
        });
        spots.push(...spotsInFrame);
      });
    } else {
      data.forEach(frame => {
        const spotsInFrame = frame.spot_references.map((spot: SpotReference) => {
          const measures: Measure = spot.measures;
          let status = 'disabled';
          if (this.checkValid('pop_inmkt', measures) &&
            this.checkValid('reach_pct', measures)) {
            status = 'open';
          }
          const location = frame['location'] || [];
          const formattedSpot: CustomizedSpot = {
            checked: true,
            opp: frame.representations[0]['account']['parent_account_name'],
            sid: spot.spot_id,
            fid: frame.frame_id,
            mt: frame.media_type['name'],
            pid: frame.plant_frame_id,
            totwi: measures.imp,
            tgtwi: measures.imp_target,
            tgtinmi: measures.pct_imp_target_inmkt,
            compi: measures.index_comp_target,
            reach: measures.reach_pct,
            cwi: measures.pct_comp_imp_target,
            tgtinmp: measures.pct_imp_target_inmkt,
            compinmi: measures.pct_comp_imp_target_inmkt,
            totinmp: measures.pct_imp_inmkt,
            freq: measures.freq_avg,
            trp: measures.trp,
            totinmi: measures.imp_inmkt,
            tgtmp: measures.pop_target_inmkt,
            totmp: measures.pop_inmkt,
            tgt_aud_impr: measures.imp_target,
            status: status,
            media_name: frame.media_name,
            classification_type: frame['classification_type'] ? frame['classification_type']['name'] : '',
            construction_type: frame['construction_type'] ? frame['construction_type']['name'] : '',
            digital: frame['digital'] ? frame['digital'] : '',
            max_height: frame['max_height'] && this.formatService
              .sanitizeString(this.formatService
                .getFeetInches(frame['max_height'])) || '',
            max_width: frame['max_width'] && this.formatService
              .sanitizeString(this.formatService
                .getFeetInches(frame['max_width'])) || '',
            primary_artery: location['primary_artery'] || '',
            zip_code: location['zip_code'] || '',
            longitude: location['longitude'] || '',
            latitude: location['latitude'] || '',
            orientation: location['orientation'] !== 'undefined' && location['orientation'] !== '' && orientation.getOrientation(location['orientation']),
            illumination_type: (frame['illumination_type'] && frame['illumination_type']['name'])
              ? frame['illumination_type']['name'] : '',
          };
          return formattedSpot;
        });
        spots.push(...spotsInFrame);
      });
    }
    return spots;
   }

   getOperatorName(representations: Representation[]): string {
    let opp = '';
    if (representations) {
      const representation = representations.find(rep => rep['representation_type']['name'] === 'Own');
      if (representation) {
        opp = representation['account']['parent_account_name'];
        // opp = representation['division']['plant']['name'];
      }
    }
    return opp;
  }
  public async formatSpotsMeasuresFromES(inventory, client_id = null) {
    const spots = [];
    const orientation = new Orientation();
    await inventory.forEach(frame => {
      const location = frame['location'] || [];
      frame.layouts.map(lay => {
        lay.faces.map(face => {
          face.spots.map((spot) => {
            if (spot['id']) {
              const formattedSpot: CustomizedSpot = {
                checked: true,
                opp: this.getOperatorName(frame.representations),
                sid: spot['id'],
                fid: frame['id'],
                mt: frame.media_type['name'],
                pid: frame.plant_frame_id,
                totwi: null,
                tgtwi: null,
                tgtinmi: null,
                compi: null,
                reach: null,
                cwi: null,
                tgtinmp: null,
                compinmi: null,
                totinmp: null,
                freq: null,
                trp: null,
                totinmi: null,
                tgtmp: null,
                totmp: null,
                tgt_aud_impr: null,
                status: 'disabled',
                media_name: frame.media_name,
                classification_type: frame['classification_type'] ? frame['classification_type']['name'] : '',
                construction_type: frame['construction_type'] ? frame['construction_type']['name'] : '',
                digital: frame['digital'] ? frame['digital'] : '',
                max_height: frame['max_height'] && this.formatService
                  .sanitizeString(this.formatService
                    .getFeetInches(frame['max_height'])) || '',
                max_width: frame['max_width'] && this.formatService
                  .sanitizeString(this.formatService
                    .getFeetInches(frame['max_width'])) || '',
                primary_artery: location['primary_artery'] || '',
                zip_code: location['zip_code'] || '',
                longitude: location['longitude'] || '',
                latitude: location['latitude'] || '',
                orientation: location['orientation'] !== 'undefined'
                && location['orientation'] !== '' && orientation.getOrientation(location['orientation']),
                illumination_type: (frame['illumination_type'] && frame['illumination_type']['name'])
                  ? frame['illumination_type']['name'] : '',
              };
              // return formattedSpot;
              spots.push(formattedSpot);
            }
          });
        });
      });
    });
    return spots;
  }

  public async formatSpotIdsFoES(inventory, client_id) {
    const spots = [];
    await inventory.forEach(frame => {
      frame.layouts.map(lay => {
        lay.faces.map(face => {
          face.spots.map((spot) => {
            if (spot['id']) {
              const formattedSpot = {
                classification_type: frame['classification_type'],
                construction_type: frame['construction']['construction_type'],
                digital: frame['digital'] ,
                spot_id: spot['id'],
                frame_id: frame['id'],
                geometry: frame['location'],
                illumination_type: frame['illumination_type'],
                location: frame['location'],
                max_height: frame['max_height'],
                max_width: frame['max_width'],
                media_status: frame['media_status'],
                media_type: frame['media_type'],
                plant_frame_id: frame['plant_frame_id'],
                representations: frame['representations'],
                spot_references: [spot],
                uri: frame['uri'],
                client_id: client_id
              };
              // return formattedSpot;
              spots.push(formattedSpot);
            }
          });
        });
      });
      /* const spotsInFrame = frame.layout[0].faces[0].spots.map((spot) => {
        if (spot['id']) {
          const formattedSpot = {
            classification_type: frame['classification_type'],
            construction_type: frame['construction']['construction_type'],
            digital: frame['digital'] ,
            spot_id: spot['id'],
            frame_id: frame['id'],
            geometry: frame['location'],
            illumination_type: frame['illumination_type'],
            location: frame['location'],
            max_height: frame['max_height'],
            max_width: frame['max_width'],
            media_status: frame['media_status'],
            media_type: frame['media_type'],
            plant_frame_id: frame['plant_frame_id'],
            representations: frame['representations'],
            spot_references: [spot],
            uri: frame['uri']
          };
          return formattedSpot;
        }
      });
      spots.push(...spotsInFrame); */
    });
    return spots;
  }

  /**
   * Explore panel format
   */
  public async formatSpotIds(inventory) {
    const spots = [];
    await inventory.forEach(frame => {
      const spotsInFrame = frame.spot_references.map((spot) => {
        if (spot['spot_id']) {
          const formattedSpot = {
            classification_type: frame['classification_type'],
            construction_type: frame['construction_type'],
            digital: frame['digital'] ,
            spot_id: spot['spot_id'],
            frame_id: frame['frame_id'],
            geometry: frame['location'],
            illumination_type: frame['illumination_type'],
            location: frame['location'],
            max_height: frame['max_height'],
            max_width: frame['max_width'],
            media_status: frame['media_status'],
            media_type: frame['media_type'],
            plant_frame_id: frame['plant_frame_id'],
            representations: frame['representations'],
            spot_references: [spot],
            uri: frame['uri']
          };
          return formattedSpot;
        }
      });
      spots.push(...spotsInFrame);
    });
    return spots;
  }
}
