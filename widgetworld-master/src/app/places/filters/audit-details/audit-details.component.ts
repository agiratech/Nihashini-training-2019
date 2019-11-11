import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonService, MapService } from '@shared/services';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { matRangeDatepickerRangeValue } from '@interTypes/placeFilters';
import {
  Place,
  Status,
  Polygon,
  OutCome,
  CreatePlaceReq,
  OpenHours,
  Hours,
  AuditedPlace,
  Geometry,
  AreaType,
  PlaceType,
  ElasticSearchType
} from '@interTypes/Place-audit-types';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from './../../../Interfaces/workspaceV2';
import { PlacesFiltersService } from '../places-filters.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StaticMapProperties } from '@interTypes/staticMapProperties';
@Component({
  selector: 'app-audit-details',
  templateUrl: './audit-details.component.html',
  styleUrls: ['./audit-details.component.less']
})

export class AuditDetailsComponent implements OnInit, OnChanges, OnDestroy {

  @Output() facilityMapData = new EventEmitter();
  @Output() closeFacilityMap = new EventEmitter();
  @Output() closeDetailsWindow = new EventEmitter();
  @Output() listHereIdDetails = new EventEmitter();
  @Output() placeComplete: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() safegraphPlace;
  @Input() place: Place | AuditedPlace;
  @Input() updatedPlaceInfo;
  @Input() clientId: string;
  @Input() updatedPlacePosition: number[] = [];
  public readonly duration = {
    WEEKDAYS: 'WD',
    ALL: 'ALL'
  };
  // tslint:disable-next-line: max-line-length
  // public times: any[] = [ '0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'];

  public times: any[] = [{ value: '', label: '' }, 
  { value: '0000', label: '12 AM' }, { value: '0100', label: '01 AM' },
  { value: '0200', label: '02 AM' }, { value: '0300', label: '03 AM' },
  { value: '0400', label: '04 AM' }, { value: '0500', label: '05 AM' },
  { value: '0600', label: '06 AM' }, { value: '0700', label: '07 AM' },
  { value: '0800', label: '08 AM' }, { value: '0900', label: '09 AM' },
  { value: '1000', label: '10 AM' }, { value: '1100', label: '11 AM' },
  { value: '1200', label: '12 PM' }, { value: '1300', label: '01 PM' },
  { value: '1400', label: '02 PM' }, { value: '1500', label: '03 PM' },
  { value: '1600', label: '04 PM' }, { value: '1700', label: '05 PM' },
  { value: '1800', label: '06 PM' }, { value: '1900', label: '07 PM' },
  { value: '2000', label: '08 PM' }, { value: '2100', label: '09 PM' },
  { value: '2200', label: '10 PM' }, { value: '2300', label: '11 PM' }
  ];

  public timesnextday = [...this.times, { value: '2400', label: '12 AM next day' }, { value: '2400 0100', label: '01 AM next day' },
  { value: '2400 0200', label: '02 AM next day' }, { value: '2400 0300', label: '03 AM next day' },
  { value: '2400 0400', label: '04 AM next day' }, { value: '2400 0500', label: '05 AM next day' },
  { value: '2400 0600', label: '06 AM next day' }, { value: '2400 0700', label: '07 AM next day' },
  { value: '2400 0800', label: '08 AM next day' }, { value: '2400 0900', label: '09 AM next day' },
  { value: '2400 1000', label: '10 AM next day' }, { value: '2400 1100', label: '11 AM next day' },
  { value: '2400 1200', label: '12 PM next day' }];

  /* { value: '2400 1300', label: '01 PM next day' },
  { value: '2400 1400', label: '02 PM next day' }, { value: '2400 1500', label: '03 PM next day' },
  { value: '2400 1600', label: '04 PM next day' }, { value: '2400 1700', label: '05 PM next day' },
  { value: '2400 1800', label: '06 PM next day' }, { value: '2400 1900', label: '07 PM next day' },
  { value: '2400 2000', label: '08 PM next day' }, { value: '2400 2100', label: '09 PM next day' },
  { value: '2400 2200', label: '10 PM next day' }, { value: '2400 2300', label: '11 PM next day' },
  { value: '2400 0000', label: '12 PM next day' } */

  public contentHeight: number;
  public isOpenedHours = false;
  public outcomes$: Observable<OutCome[]>;
  public statuses$: Observable<Status[]>;
  public placeTypes$: Observable<PlaceType[]>;
  selectedDate: any;
  auditDetailForm: FormGroup;
  customFields: FormArray;
  notes = [];
  hoursData = [];
  dateInlineRange: matRangeDatepickerRangeValue<Date>;
  public buildingAreaPolygon: Polygon = {};
  public propertyArea: Polygon = {};
  public buildAreaProperties: StaticMapProperties;
  public propertyAreaProperties: StaticMapProperties;
  private placePosition: number[] = [];
  private unSubscribe: Subject<void> = new Subject<void>();
  public isExpandDetails = false;
  public isCollapseDetails = false;
  public isFacilityMapOpen = false;
  public isRequiredReview = false;
  public isPlaceRequiredReview = false;
  private isPolygonChanged = false;
  saveChangesFlag = false;
  public searchTextCtrl: FormControl = new FormControl();
  @ViewChild('fName', { static: false }) focusNameRef: ElementRef;
  private hoursFieldchanges = false;
  public updatedDate = '';
  public updatedBy = '';

  constructor(private common: CommonService,
    private fb: FormBuilder,
    private placesFilterService: PlacesFiltersService,
    private mapService: MapService,
    public dialog: MatDialog) {
    this.outcomes$ = placesFilterService.getPlacesOutcomes(true);
    this.statuses$ = placesFilterService.getPlaceStatuses(true);
    this.placeTypes$ = placesFilterService.getPlaceTypes(true);
  }
  ngOnInit() {
    const place = this.place || {};
    this.initializeProperties();
    this.auditDetailForm = this.fb.group({
      name: '',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      // hereId: '',
      safegraphId: '',
      outcome: '',
      // TODO : Need to find how to populate hours?
      hours: this.fb.group({
        mo: this.fb.group({
          from: '',
          to: '',
        }),
        tu: this.fb.group({
          from: '',
          to: '',
        }),
        we: this.fb.group({
          from: '',
          to: '',
        }),
        th: this.fb.group({
          from: '',
          to: '',
        }),
        fr: this.fb.group({
          from: '',
          to: '',
        }),
        sa: this.fb.group({
          from: '',
          to: '',
        }),
        su: this.fb.group({
          from: '',
          to: '',
        }),
      }),
      floors: '',
      entrances: '',
      concourses: '',
      platforms: '',
      gates: '',
      placeStatus: '',
      placeType: '',
      parentPlaceID: '',
      /*customFields: this.fb.array([]),
      notes: this.fb.group({
        name: [],
        note: [],
      })*/
    });
    this.dateInlineRange = { begin: null, end: null };
    this.onResize();
    this.onFillAuditDetailFormUnaudit(this.place);
    this.auditDetailForm.controls['name'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          this.updatePlacePositionByGeoCoding(this.auditDetailForm.getRawValue());
        }
      });
    this.auditDetailForm.controls['street'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          this.updatePlacePositionByGeoCoding(this.auditDetailForm.getRawValue());
        }
      });
    this.auditDetailForm.controls['city'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          this.updatePlacePositionByGeoCoding(this.auditDetailForm.getRawValue());
        }
      });
    this.auditDetailForm.controls['state'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          this.updatePlacePositionByGeoCoding(this.auditDetailForm.getRawValue());
        }
      });
    this.auditDetailForm.controls['zipcode'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          this.updatePlacePositionByGeoCoding(this.auditDetailForm.getRawValue());
        }
      });
  }

  addCustomField(): FormGroup {
    return this.fb.group({
      name: '',
      value: '',
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.safegraphPlace && changes.safegraphPlace.currentValue) {
      this.resetPlaceValues();
      this.isCollapseDetails = false;
      this.onFillAuditDetailForm(changes.safegraphPlace.currentValue);
    }
    if (changes.place && changes.place.currentValue) {
      this.resetPlaceValues();
      this.onResize();
      if (this.searchTextCtrl) {
        this.searchTextCtrl.setValue('');
      }
      this.isCollapseDetails = false;
      this.onFillAuditDetailFormUnaudit(changes.place.currentValue);
    }
    if (changes.updatedPlaceInfo && changes.updatedPlaceInfo.currentValue) {
      const info = changes.updatedPlaceInfo.currentValue;
      if (info['type'] === 'building') {
        this.buildingAreaPolygon = info['polygonData'];
        this.buildAreaProperties.feature = info['polygonData'];
        this.buildAreaProperties.coordinates = this.placePosition.length ? this.placePosition : info['center'];
        if (info['center']) {
          const place: Geometry = {
            coordinates: info['center'],
            type: 'Point',
          };
          this.place.nav_geometry = place;
        }
        this.buildAreaProperties = JSON.parse(JSON.stringify(this.buildAreaProperties));
        this.isPolygonChanged = true;
      }
      if (info['type'] === 'property') {
        this.propertyArea = info['polygonData'];
        this.propertyAreaProperties.feature = info['polygonData'];
        this.propertyAreaProperties.coordinates = this.placePosition.length ? this.placePosition : info['center'];
        this.propertyAreaProperties = JSON.parse(JSON.stringify(this.propertyAreaProperties));
        this.isPolygonChanged = true;
      }
    }
    if (changes.updatedPlacePosition && changes.updatedPlacePosition.currentValue && changes.updatedPlacePosition.currentValue.length) {
      this.placePosition = changes.updatedPlacePosition.currentValue;
      this.buildAreaProperties.coordinates = this.placePosition;
      this.propertyAreaProperties.coordinates = this.placePosition;
    }
  }
  private onFillAuditDetailFormUnaudit(place: Place | AuditedPlace) {
    if (this.auditDetailForm) {
      this.auditDetailForm.reset();
      if (place['audit_status_cd']
        && place['audit_status_cd'] === 3) {
        this.isRequiredReview = true;
        this.isPlaceRequiredReview = true;
      } else {
        this.isRequiredReview = false;
      }
      this.onResize();
      const formData = {
        name: place.location_name && place.location_name || '',
        street: place.street_address && place.street_address || '',
        city: place.city && place.city || '',
        state: place.state && place.state || '',
        zipcode: place.zip_code && place.zip_code || '',
        placeStatus: place['audit_status_cd'] || '',
        outcome: place['audit_outcome_id'] || '',
        placeType: place['place_type_id'] || '',
        floors: place['building_area'] && place['building_area']['no_floors'] && place['building_area']['no_floors'] || '',
        entrances: place['building_area'] && place['building_area']['no_entrances'] && place['building_area']['no_entrances'] || '',
        concourses: place['building_area'] && place['building_area']['no_concourses'] && place['building_area']['no_concourses'] || '',
        platforms: place['building_area'] && place['building_area']['no_platforms'] && place['building_area']['no_platforms'] || '',
        gates: place['building_area'] && place['building_area']['no_gates'] && place['building_area']['no_gates'] || '',
        parentPlaceID: place['parent_place_id'] && place['parent_place_id'] || ''
      };
      if (place['building_area'] && place['building_area']['geometry']) {
        this.buildingAreaPolygon = place['building_area']['geometry'];
        this.buildAreaProperties.feature = place['building_area']['geometry'];
        this.onOpenFacilityMap('building');
      } else {
        this.addNewArea('building');
      }
      if (place['property_geometry']) {
        this.propertyArea = place['property_geometry'];
        this.propertyAreaProperties.feature = place['property_geometry'];
      }
      if (place['display_geometry']) {
        this.placePosition = place['display_geometry']['coordinates'];
        setTimeout(() => {
          this.placesFilterService.setPlaceCoords(this.placePosition);
        }, 1000);
        this.buildAreaProperties.coordinates = this.placePosition;
        this.propertyAreaProperties.coordinates = this.placePosition;
      } else {
        this.updatePlacePositionByGeoCoding(place);
      }
      this.setOpenHours(place['open_hours']);
      this.auditDetailForm.patchValue(formData);
    }
    if (place['status'] !== 0) {
      this.updatedBy = place['update_user'] && place['update_user'];
      this.updatedDate = place['update_ts'] && place['update_ts'];
    } else {
      this.updatedBy = place['create_user'] && place['create_user'];
      this.updatedDate = place['create_ts'] && place['create_ts'];
    }
    setTimeout(() => {
      this.focusNameRef.nativeElement.focus();
    }, 100);
  }

  /**
   * This function is to update the placeposition by getting data from Mapbox Geocoding API
   */
  private updatePlacePositionByGeoCoding(place) {
    this.mapService.getPositionByAddress({
      name: place['location_name'] || place['name'],
      street: place['street_address'] || place['street'],
      zipcode: place['zip_code'] || place['zipcode'],
      city: place['city'],
      state: place['state']
    }).pipe(takeUntil(this.unSubscribe)).subscribe(result => {
      if (result && result['Location'] &&
        result['Location']['DisplayPosition']) {
        this.placePosition = [result['Location']['DisplayPosition']['Longitude'], result['Location']['DisplayPosition']['Latitude']];
        this.placesFilterService.setPlaceCoords(this.placePosition);
        this.buildAreaProperties.coordinates = this.placePosition;
        this.propertyAreaProperties.coordinates = this.placePosition;
      }
    });
  }
  /**
   * This function is to fill the form with the data got from safegraph places API
   * @param place
   */
  private onFillAuditDetailForm(place) {
    if (this.auditDetailForm) {
      this.auditDetailForm.patchValue({
        name: place.location_name && place.location_name || '',
        street: place.address && place.address.street_address && place.address.street_address || '',
        city: place.address && place.address.city && place.address.city || '',
        state: place.address && place.address.state && place.address.state || '',
        zipcode: place.address && place.address.zip_code && place.address.zip_code || '',
        // hereId: place.ids && place.ids.parent_safegraph_place_id && place.ids.parent_safegraph_place_id || '',
        safegraphId: place.ids && place.ids.safegraph_place_id && place.ids.safegraph_place_id || '',
      });
      if (place.operating_information && place.operating_information.open_hours) {
        this.setOpenHours(place.operating_information.open_hours, true);
      }
      if (place.location && place.location.polygon) {
        const polygon = this.convertPolygon(place.location.polygon)
        this.buildingAreaPolygon = polygon;
        this.buildAreaProperties.feature = polygon;
      }
      if (place.location && place.location.point) {
        this.placePosition = place.location.point.coordinates;
        this.place.nav_geometry = place.location.point;
        this.place.display_geometry = place.location.point;
        this.buildAreaProperties.coordinates = place.location.point.coordinates;
        this.propertyAreaProperties.coordinates = place.location.point.coordinates;
      }
    }

    setTimeout(() => {
      this.focusNameRef.nativeElement.focus();
    }, 100);
  }

  /**
   * This function is to reset polygon properties
   */
  private resetPlaceValues() {
    this.propertyArea = {};
    this.buildingAreaPolygon = {};
    this.placePosition = [];
    this.initializeProperties();
    if (this.auditDetailForm) {
      this.auditDetailForm.reset();
    }
  }

  /**
   * This function is to initialize polygon properties
   */
  private initializeProperties() {
    this.buildAreaProperties = {
      zoom: 17,
      coordinates: [],
      width: 330,
      height: 140,
      feature: {},
      alt: 'Building Area',
      fillColor: '#2196F3',
      stokeColor: '#2196F3'
    };
    this.propertyAreaProperties = {
      zoom: 17,
      coordinates: [],
      width: 330,
      height: 140,
      feature: {},
      alt: 'Property Area',
      fillColor: '#DD6666',
      stokeColor: '#DD6666'
    };
  }

  onAddCustomField() {
    this.customFields = this.auditDetailForm.get('customFields') as FormArray;
    this.customFields.push(this.addCustomField());
  }
  onAddNoteField() {
    const formData = this.auditDetailForm.getRawValue();
    if (
      (formData.notes['name'] && formData.notes['name'].trim().length > 0)
      && (formData.notes['note'] && formData.notes['note'].trim().length > 0)) {
      this.notes.push({
        name: formData.notes['name'],
        note: formData.notes['note']
      });
      this.auditDetailForm.controls['notes']['controls']['name'].setValue('');
      this.auditDetailForm.controls['notes']['controls']['note'].setValue('');
    }
  }
  onRemoveCustomField(customFieldIndex) {
    this.customFields.controls.splice(customFieldIndex, 1);
  }
  onResize() {
    if (this.place['status'] === 0) {
      this.contentHeight = window.innerHeight - 220;
    } else {
      this.contentHeight = window.innerHeight - (this.isRequiredReview ? 340 : 280);
    }
  }
  onOpenHours(state = true) {
    this.common.setDropdownState(state);
    this.auditDetailForm.controls['hours']['controls']['hoursName'].setValue('');
  }
  /*onSelectHoursDate(event) {
    this.selectedDate = event;
  }

  // Assigning start and end date value
  inlineRangeChange($event) {
    this.dateInlineRange = $event;
  }

  // to save selected dates
  onSaveHours() {
    const formData = this.auditDetailForm.getRawValue();
    if (formData.hours['hoursName'] && formData.hours['hoursName'].trim().length > 0) {
      const hours = {
        name: formData.hours['hoursName'],
        date: this.dateInlineRange
      };
      this.hoursData.push(hours);
      this.onOpenHours(false);
      this.dateInlineRange= { begin: null, end: null};
    }
  }*/
  validateForm(data) {
    const validationKeys = ['name', 'street', 'city', 'state', 'zipcode'];
    const errorFields = [];
    for (let i = 0; i < validationKeys.length; i++) {
      if (data[validationKeys[i]] === '') {
        errorFields.push((validationKeys[i]).charAt(0).toUpperCase() + (validationKeys[i]).slice(1));
      }
    }
    if (!this.buildingAreaPolygon.type) {
      errorFields.push('Building Area');
    }
    if (!this.propertyArea.type) {
      errorFields.push('Property Area');
    }
    if (errorFields.length > 0) {
      const message = 'Enter details for ' + errorFields.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1');

      /* COMMENTED on Sep 27: For tracking purpose */
      /* if (errorFields.length > 0 && mapErrors.length > 0) {
        message += errorFields.join(', ') + ' and draw polygon for ' + mapErrors.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1');
      } else if (errorFields.length > 0) {
        message += errorFields.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1');
      } else {
        message = 'Draw polygon for ' + mapErrors.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1');
      } */
      const dialogueData: ConfirmationDialog = {
        notifyMessage: true,
        confirmTitle: 'Error',
        messageText: `${message} to save changes.`,
      };
      this.dialog.open(ConfirmationDialogComponent, {
        data: dialogueData,
        width: '586px',
        panelClass: 'placeAuditInfoMsg'
      });
      return false;
    }
    return true;
  }
  onSubmit(data) {
    const reqData: CreatePlaceReq = {
      audit_outcome_id: data.placeStatus === 3 ? data.outcome : '',
      building_area: {
        no_floors: parseInt(data.floors) || null,
        no_concourses: parseInt(data.concourses) || null,
        no_entrances: parseInt(data.entrances) || null,
        no_gates: parseInt(data.gates) || null,
        no_platforms: parseInt(data.platforms) || null,
        geometry: this.buildingAreaPolygon,
      },
      city: data.city,
      location_name: data.name,
      street_address: data.street,
      state: data.state,
      zip_code: data.zipcode,
      // here_id: data.hereId,
      property_geometry: this.propertyArea,
      display_geometry: {
        'type': 'Point',
        'coordinates': this.placePosition
      },
      nav_geometry: {
        'type': 'Point',
        'coordinates': this.placePosition
      },
      open_hours: this.formatOpenHoursForAPI(data.hours),
      client_id: this.clientId,
      iso_country_code: 'US',
      safegraph_id: data.safegraphId,
      is_focused: false,
      is_active: false,
      is_data_collection_area: false,
      audit_status_cd: data.placeStatus,
      place_type_id: data.placeType,
      parent_place_id: data.parentPlaceID
    };
      if (this.place['status'] === 0) {
        reqData['audit_status_cd'] = 1;
        // this.saveChangesFlag = true;
      }
      if (this.saveChangesFlag || this.place['status'] === 0) {
        if (!this.validateForm(data)) {
          if (this.place['status'] !== 0) {
            this.saveChangesFlag = false;
          }
          return;
        }
        this.placesFilterService
          .updateAuditedPlace(reqData, this.place.place_id)
          .pipe(takeUntil(this.unSubscribe))
          .subscribe(response => {
            const dialogueData: ConfirmationDialog = {
              notifyMessage: true,
              confirmTitle: 'Success',
              messageText: response.message || 'Place Created Successfully',
            };
            this.dialog.open(ConfirmationDialogComponent, {
              data: dialogueData,
              width: '586px',
              panelClass: 'placeAuditInfoMsg'
            }).afterClosed().subscribe(result => {
              this.auditDetailForm.markAsPristine();
              if (!this.saveChangesFlag) {
                this.placeComplete.emit(true);
              }
              this.saveChangesFlag = false;
              this.isPolygonChanged = false;
              this.hoursFieldchanges = false;
            });
          }, error => {
            this.saveChangesFlag = false;
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                notifyMessage: true,
                confirmTitle: 'Error',
                messageText: error.error['api-message'] || 'Something went wrong'
              },
              width: '586px',
              panelClass: 'placeAuditInfoMsg'
            });
          });
      } else {
        const dialogueData: ConfirmationDialog = {
          notifyMessage: false,
          confirmDesc: '<h4 class="confirm-text-icon">Your changes to the place will not be saved. Would you like to continue?</h4>',
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          headerCloseIcon: false
        };
        if (this.isPolygonChanged || !this.auditDetailForm.pristine || this.hoursFieldchanges) {
          this.dialog.open(ConfirmationDialogComponent, {
            data: dialogueData,
            disableClose: true,
            width: '586px',
            height: '210px'
          }).afterClosed().subscribe(result => {
            if (result && result['action']) {
              this.placeComplete.emit(true);
              this.isPolygonChanged = false;
            }
          });
        } else {
          this.placeComplete.emit(true);
          this.isPolygonChanged = false;
        }
      }
    /* if (!this.place.place_id) {
      if (!this.validateForm(data)) {
        return;
      }

      this.placesFilterService.createAuditedPlace(reqData)
        .pipe(takeUntil(this.unSubscribe))
        .subscribe(response => {
          const dialogueData: ConfirmationDialog = {
            notifyMessage: false,
            confirmDesc: '<h4 class="confirm-text-icon"><i class="material-icons">check_circle</i></i>You have successfully requested insights.</h4>',
            confirmButtonText: 'Next Place',
            cancelButtonText: 'Close',
            headerCloseIcon: false
          };
          this.auditDetailForm.markAsPristine();
          this.placesFilterService
            .linkPlacetoUserPlace(parseInt(this.clientId), parseInt(response.data.place_id), this.place['id'], true)
            .pipe(takeUntil(this.unSubscribe))
            .subscribe((response1) => {

            });
          this.dialog.open(ConfirmationDialogComponent, {
            data: dialogueData,
            disableClose: true,
            width: '586px',
            height: '190px'
          }).afterClosed().subscribe(result => {
            if (result && result['action']) {
              this.placeComplete.emit(true);
            } else {
              this.placesFilterService.setPlaceAudit(null);
            }
          });
        }, error => {
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              notifyMessage: true,
              confirmTitle: 'Error',
              messageText: error.error['api-message'] || 'Something went wrong'
            },
            width: '586px',
            panelClass: 'placeAuditInfoMsg'
          });
        });
    } else {
      
    } */
  }

  /**
   * This function is to load new map with empty data
   * @param type value will be either building or property
   */
  public addNewArea(type: AreaType) {
    this.setMapVisibleAttrs();
    this.facilityMapData.emit({
      type: type, polygonData: {},
      placePosition: this.placePosition,
      buildingAreaPolygon: this.buildingAreaPolygon
    });
  }

  /**
   * This function is to set the values which we used for map displaying
   */
  private setMapVisibleAttrs() {
    this.isExpandDetails = true;
    this.isFacilityMapOpen = true;
  }

  /**
   * This function is to open the facility map for editing of building/property area,
   * @param areaType value will be either building or property
   */
  public onOpenFacilityMap(areaType: AreaType) {
    this.setMapVisibleAttrs();
    switch (areaType) {
      case 'building':
        this.facilityMapData.emit({
          type: areaType,
          polygonData: this.buildingAreaPolygon,
          placePosition: this.placePosition
        });
        break;
      case 'property':
        this.facilityMapData.emit({
          type: areaType,
          polygonData: this.propertyArea,
          placePosition: this.placePosition,
          buildingAreaPolygon: this.buildingAreaPolygon
        });
        break;
    }
  }
  /**
   * This function is used to emit search params to here places component
   * @param type
   * @param searchInput
   */
  public onSearch(type: ElasticSearchType, searchText) {
    if (searchText) {
      this.isExpandDetails = true;
      this.listHereIdDetails.emit({ type: type, searchText: searchText });
    }
  }
  public copyValues(range: string) {
    const from = this.auditDetailForm.controls['hours']['controls']['mo']['controls']['from']['value'];
    const to = this.auditDetailForm.controls['hours']['controls']['mo']['controls']['to']['value'];
    // const ext = this.auditDetailForm.controls['hours']['controls']['mo']['controls']['ext']['value'];
    // setting range by checking if this is weekdays only or all
    const limit = (range === this.duration.ALL) ? 6 : 4;
    const hours = this.auditDetailForm.get('hours') as FormArray;
    Object.keys(hours.controls).map((day, index) => {
      if (index !== 0 && index <= limit) {
        if (from && from !== 'undefined') {
          this.auditDetailForm.controls['hours']['controls'][day]['controls']['from'].patchValue(from);
          this.hoursFieldchanges = true;
        }
        if (to) {
          this.auditDetailForm.controls['hours']['controls'][day]['controls']['to'].patchValue(to);
          this.hoursFieldchanges = true;
        }
        // if (ext !== 'undefined') {
        //   this.auditDetailForm.controls['hours']['controls'][day]['controls']['ext'].patchValue(ext);
        //   this.hoursFieldchanges = true;
        // }
      } else if (index !== 0 &&  index >= limit) {
        this.auditDetailForm.controls['hours']['controls'][day]['controls']['from'].patchValue('');
        this.auditDetailForm.controls['hours']['controls'][day]['controls']['to'].patchValue('');
      }
    });
  }
  public openPlacesDetail() {
    this.isCollapseDetails = false;
    this.isExpandDetails = true;
  }
  public collapseDetails() {
    this.isCollapseDetails = true;
    this.isExpandDetails = false;
  }
  public closeDetails() {
    const data: ConfirmationDialog = {
      notifyMessage: false,
      confirmDesc: '<h4 class="confirm-text-icon">Your changes to the place will not be saved. Would you like to continue?</h4>',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      headerCloseIcon: false
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: '586px'
    }).afterClosed().subscribe(result => {
      if (result && result.action) {
        this.closeDetailsWindow.emit({ 'close': true });
      }
    });
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  searchInformation(type: string) {
    const auditDetail = this.auditDetailForm.getRawValue();
    const coOrdinates = this.placePosition.length ? this.placePosition : [];
    let subUrl = this.searchWordSeparate(auditDetail.name) +
      '%2C+' + this.searchWordSeparate(auditDetail.street) +
      '%2C+' + this.searchWordSeparate(auditDetail.city) +
      '%2C+' + this.searchWordSeparate(auditDetail.state) +
      '+' + this.searchWordSeparate(auditDetail.zipcode);
    let url = 'https://www.google.com/search?q=' + subUrl;

    if (type === 'street') {
      subUrl = this.searchWordSeparate(auditDetail.name) +
        ',+' + this.searchWordSeparate(auditDetail.street) +
        ',+' + this.searchWordSeparate(auditDetail.city) +
        ',+' + this.searchWordSeparate(auditDetail.state) +
        ',+' + this.searchWordSeparate(auditDetail.zipcode);
      const lat = coOrdinates[1];
      const long = coOrdinates[0];
      url = 'https://www.google.com/maps?q=' + subUrl;
      if (lat && long) {
        url += '&layer=c&cbll=' + lat + ',' + long;
      }
      url += '&cbp=11,0,0,0,0';
    }

    window.open(url, '_blank');

  }

  private searchWordSeparate(address: string, ) {
    let wordSeparate = [];
    if (address) {
      wordSeparate = address.split(' ');
    } else {
      address = '';
    }

    if (wordSeparate.length > 1) {
      address = wordSeparate.reduce((a, b) => a + '+' + b);
    }
    return address;
  }

  /**
   * This function is to set open hours
   * @param openHours
   */
  public setOpenHours(openHours = {}, isSafegraphData = false) {
    const dayNames = Object.keys(openHours);
    if (dayNames.length > 0) {
      const hours = this.auditDetailForm.get('hours') as FormArray;
      if (isSafegraphData) {
        Object.keys(hours.controls).map(day => {
          const dayName = dayNames.find(name => name.toLowerCase().includes(day));
          if (dayName && openHours[dayName][0]) {
            this.auditDetailForm.controls['hours']['controls'][day]['controls']['from'].patchValue(openHours[dayName][0].open.length > 3 ? openHours[dayName][0].open : `0${openHours[dayName][0].open}`);
            this.auditDetailForm.controls['hours']['controls'][day]['controls']['to'].patchValue(openHours[dayName][0].close.length > 3 ? openHours[dayName][0].close : `0${openHours[dayName][0].close}`);
          }
        });
      } else {
        Object.keys(hours.controls).map(day => {
          if (openHours[day]) {
            const time = openHours[day].trim().split('-');
            this.auditDetailForm.controls['hours']['controls'][day]['controls']['from'].patchValue(time[0]);
            this.auditDetailForm.controls['hours']['controls'][day]['controls']['to'].patchValue(time[1]);
          }
        });

      }
    }
  }

  /**
   * This function is to format hours data for API submission
   */
  private formatOpenHoursForAPI(hours: OpenHours<Hours>): OpenHours<string> {
    const data: OpenHours<string> = {};
    for (const day in hours) {
      if (hours.hasOwnProperty(day)) {
        if (hours[day]['from']) {
          data[day] = hours[day]['from'];
        }
        if (hours[day]['from'] && hours[day]['to']) {
          data[day] += '-';
        }
        if (hours[day]['to']) {
          data[day] += hours[day]['to'];
        }
        /* if (hours[day]['ext']) {
          data[day] += ' ' + hours[day]['ext'];
        } */
      }
    }
    return data;
  }


  /**
   * This functions is to convert polygon to multipolygon
   */
  private convertPolygon(polygon) {
    let combinedFeature: any;
    if (polygon['type'] === 'MultiPolygon') {
      return polygon;
    }
    if (polygon['coordinates'].length === 1) {
      combinedFeature = { type: 'MultiPolygon', coordinates: [] };
      combinedFeature.coordinates.push(polygon['coordinates']);
      return combinedFeature;
    }
  }
  public selectAuditStatus(selectedAuditStatus) {
    if (selectedAuditStatus.value === 3) {
      this.isRequiredReview = true;
    } else {
      this.isRequiredReview = false;
      // if (this.auditDetailForm) {
      //   this.auditDetailForm.controls.outcome.setValue('');
      // }
    }
    this.onResize();
  }
  clearAllTimeData() {
    const hours = this.auditDetailForm.get('hours') as FormArray;
    Object.keys(hours.controls).map((day, index) => {
      this.auditDetailForm.controls['hours']['controls'][day]['controls']['from'].patchValue(null);
      this.auditDetailForm.controls['hours']['controls'][day]['controls']['to'].patchValue(null);
    });
  }
}
