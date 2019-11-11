import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {
  PlacesDataService,
  PlacesService,
  LoaderService
} from '@shared/services';
import swal from 'sweetalert2';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlacesFiltersService } from '../../../places/filters/places-filters.service';
import { PlacesElasticsearchService } from '../../../places/filters/places-elasticsearch.service';
import { takeWhile, map } from 'rxjs/operators';

@Component({
  selector: 'app-place-set',
  templateUrl: './save-place-sets-dialog.component.html',
  styleUrls: ['./save-place-sets-dialog.component.less']
})
export class SavePlaceSetsDialogComponent implements OnInit, OnDestroy {
  placeSetForm: FormGroup;
  errorMessage = 'Place set name can\'t empty';
  title = 'Save Place Set';
  buttonText = 'Save';
  isExistingPlaceSet = false;
  places: any = [];
  existingPlacesSet: any[] = [];
  failedPlaceSet: any = [];
  isSpinner = false;
  noPlaceDataFound = false;
  isSavePlaceSet = false;
  isExistingPlaceId = '';
  isExistingPlaceName = '';
  duplicateExistingPlacesSet: any[] = [];
  unSubscribe = true;

  constructor(
    private fb: FormBuilder,
    private placesDataService: PlacesDataService,
    private plasesService: PlacesService,
    private loaderService: LoaderService,
    private placesFiltersService: PlacesFiltersService,
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private dialogRef: MatDialogRef<SavePlaceSetsDialogComponent>,
    private elasticSearch: PlacesElasticsearchService
  ) {
  }

  ngOnInit() {
    // TODO: Refactor this component
    this.placesDataService.getPlacesObject().subscribe(res => {
      if (typeof res['places'] !== 'undefined') {
        this.places = res['places'];
      }
      if (res['filters']['name'] !== undefined && res['filters']['pois'] !== undefined) {
        this.isExistingPlaceId = res['filters']['_id'];
        this.isExistingPlaceName = res['filters']['name'];
      } else {
        this.isExistingPlaceId = '';
        this.isExistingPlaceName = '';
      }
    });
    if (this.dialogData['selectedPlaces']) {
      this.places = this.dialogData['selectedPlaces'];
    }
    this.placesDataService.getExistingPlaceSet().subscribe(placeSet => {
      this.existingPlacesSet = placeSet;
      this.duplicateExistingPlacesSet = placeSet;
    });
    this.placeSetForm = this.fb.group({
      'name': new FormControl({
        value: this.isExistingPlaceName,
        disabled: this.dialogData.isExistingPlaceSet
      }, [Validators.required]),
      'existingPlaces': new FormControl({
        value: '',
        disabled: !this.dialogData.isExistingPlaceSet
      }, [Validators.required])
    });
  }

  onSubmit(formData) {
    const locations = {};
    if (this.dialogData.type === 'group') {
      const locationPOIs = this.placesDataService.getPOILocationData();
      const filterData = {...locationPOIs};
     
      // Here, have added following condition to avoid elastic query failure and showing warning message, in future we have to save places more than 10k to 50K
     /* if (filterData['noOfPlaces'] >= 10000) {
        this.loaderService.display(false);
        this.dialogRef.close();
        swal('Warning', 'Place sets are limited up to 10K, Please keep your selection within the 10k limit.', 'warning');
        return;
      }*/
      if (filterData['placeNames'].length >= 10000 || (this.dialogData.selectedPlacesCount && this.dialogData.selectedPlacesCount >= 10000)) {
        this.loaderService.display(false);
        this.dialogRef.close();
        swal('Warning', 'Place sets are limited up to 10K, Please keep your selection within the 10k limit.', 'warning');
        return;
      } else {
        filterData['noOfPlaces'] = 10000;
      }

      let query = this.elasticSearch.prepareElasticQuery(filterData['query']);
      if (filterData['placeNames'].length <= 0) {
        filterData['placeNames'] = ['null'];
      }
      query = this.elasticSearch.formSelectedPlacesQuery(query, filterData);
      query = this.elasticSearch.getAllSGids(query);
      this.elasticSearch.getDataFromElasticSearch(query).pipe(
        map((response: any) => {
          const sgids = [];
          if (response['hits'] && response['hits']['hits']) {
            const data = response['hits']['hits'];
            data.map(d => {
              sgids.push(d['_source']['properties']['ids']['safegraph_place_id']);
            });
          }
          return sgids;
        }),
        takeWhile(() => this.unSubscribe)
      ).subscribe(sgids => {
        locations['single'] = sgids;
        this.saveToPlaceSet(formData, locations);
      });
    } else if (this.dialogData.type === 'single') {
      const POIs = this.placesDataService.getPOIPlacesData();
      if (POIs.length > 0) {
        const selectedSGIds = [];
        POIs.map((p) => {
          if (p.selected) {
            selectedSGIds.push(p.id);
          }
        });
        if (selectedSGIds.length > 0) {
          locations['single'] = selectedSGIds;
        }
        this.saveToPlaceSet(formData, locations);
      }
    }
  }
  saveToPlaceSet(formData, locations) {
    const places = {
      'places': {
        'name': formData.value.name,
        'pois': locations
      }
    };
    if (formData.valid && !this.dialogData.isExistingPlaceSet) {
      this.loaderService.display(true);
        this.savePlaceSet(places);
    } else if (formData.valid && this.dialogData.isExistingPlaceSet) {
      this.loaderService.display(true);
      formData.value['existingPlaces'].map((exPlace, index) => {
        const placeData = JSON.parse(JSON.stringify(places));
        const existingPOIs = places['places']['pois']['single'] ? places['places']['pois']['single'] : [];
        let existingPoids = exPlace.pois;
        existingPoids = existingPOIs.concat(...existingPoids);
        placeData['places']['pois']['single'] = existingPoids;
        placeData['places']['name'] = exPlace['name'];
        const placeId = exPlace['_id'];
        this.placesFiltersService.updatePlaceSet(placeData, placeId).subscribe(
          success => {
            this.placesFiltersService.getPlacesSet().subscribe(
              res => {
                if (res['data']) {
                  this.placesDataService.setExistingPlaceSet(res['data']);
                }
              }
            )
            if (formData.value['existingPlaces'] && (index === (formData.value['existingPlaces'].length - 1))) {
              this.displayUpdatePlaceSetError();
            }
          },
          error => {
            this.failedPlaceSet.push(exPlace.name);
            if ((index === (formData.value['existingPlaces'].length - 1))) {
              this.displayUpdatePlaceSetError();
            }
          }
        );
      });
    }
  }
  checkDataPresence(place, property) {
    return place['properties'][property] && place['properties'][property] || null;
  }

  savePlaceSet(places) {
    this.placesFiltersService.savePlaceSet(places).subscribe(
      response => {
        this.loaderService.display(false);
          this.placesFiltersService.getPlacesSet().subscribe(
            res => {
              if (res['data']) {
                this.placesDataService.setExistingPlaceSet(res['data']);
                this.dialogRef.close({placeSetId: response['data'].id, allPlaceSets: res['data']});
                swal('Success', 'Place set saved successfully.', 'success');
              }
            }
          );
      },
      error => {
        this.loaderService.display(false);
        if (error.error && Number(error.error.code) === 11006) {
          swal('Error', 'Place Set names must be unique. Please add to existing set or use a unique name.', 'error');
        } else {
          swal('Error', 'An error has occurred. Please try again later.', 'error');
          this.dialogRef.close();
        }
      }
    );
  }

  displayUpdatePlaceSetError() {
    this.loaderService.display(false);
    this.dialogRef.close();
    // this.placeSetForm.reset();
    if (this.failedPlaceSet.length > 0) {
      swal('Error', 'Updating following place set ' + this.failedPlaceSet.join(',') + ' failed', 'error');
    } else {
      swal('Success', 'Your place set saved successfully.', 'success');
    }
    this.placesFiltersService.getPlacesSet().subscribe(
      response => {
        if (response['places']) {
          this.placesDataService.setExistingPlaceSet(response['places']);
        }
      }
    );
  }
  ngOnDestroy () {
    this.placeSetForm.reset();
    this.unSubscribe = false;
  }
}
