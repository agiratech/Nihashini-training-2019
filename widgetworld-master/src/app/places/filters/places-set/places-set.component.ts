import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { PlacesFiltersService } from '../places-filters.service';
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PlacesDataService } from '@shared/services/places-data.service';
@Component({
  selector: 'app-places-set',
  templateUrl: './places-set.component.html',
  styleUrls: ['./places-set.component.less']
})
export class PlacesSetComponent implements OnInit, OnChanges, OnDestroy {
  public placeSetHeight = 250;
  public placeSets: any = [];
  public searchedPlaceSets: any = [];
  public selectPlaceSetOptions = {};
  public searchQuery = '';
  private unSubscribe: Subject<void> = new Subject<void>();
  @Input() selectPlaceID;
  @Input() poiData: any;
  @Output() filterByPlaceSet: EventEmitter<any> = new EventEmitter();

  constructor(
    private placefilterService: PlacesFiltersService,
    private placesDataService: PlacesDataService
  ) { }

  ngOnInit() {
    this.culaculateHeight();
    this.getPlaces();
    this.placesDataService.getExistingPlaceSet().pipe(takeUntil(this.unSubscribe)).subscribe(placeSets => {
      this.searchedPlaceSets = placeSets;
      this.placeSets = placeSets;
      if (this.selectPlaceID && this.placeSets) {
        this.selectPlaceSetOptions = this.placeSets.filter(ps => ps['_id'] === this.selectPlaceID)[0] || {};
      }
    });

    this.placefilterService.getClearPlaseSetFilter().pipe(takeUntil(this.unSubscribe)).subscribe(data => {
      if (data && data.clear && this.selectPlaceID) {
        this.clearPlaceSet();
      }
    });
  }

  getPlaces() {
    this.placefilterService.getPlacesSet().pipe(takeUntil(this.unSubscribe))
    .subscribe( places => {
      if (places && places['data']) {
        this.placesDataService.setExistingPlaceSet(places['data']);
      }
    });
  }
  onSelectPlaceSets(place) {
    this.selectPlaceSetOptions = place;
    // console.log(place, 'place in set');
    this.filterByPlaceSet.emit(place);
  }
  culaculateHeight() {
    this.placeSetHeight = window.innerHeight - 325;
  }
  public compare(c1, c2) {
    return c1 && c2 && c1['_id'] === c2['_id'];
  }

  public onDeletePlaceSet(place) {
    swal({
      title: 'Are you sure you want to delete "' + place['name'] + '" Place Set?',
      text: '',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, DELETE',
      confirmButtonClass: 'waves-effect waves-light',
      cancelButtonClass: 'waves-effect waves-light'
    }).then((x) => {
      if (typeof x.value !== 'undefined' && x.value) {
        this.placefilterService.deletePlaceSet(place._id).pipe(takeUntil(this.unSubscribe)).subscribe(response => {
          if (this.selectPlaceSetOptions && this.selectPlaceSetOptions['_id'] === place._id) {
            this.filterByPlaceSet.emit('');
            this.selectPlaceSetOptions = {};
          }
          swal('Success', response['message'], 'success');
          this.getPlaces();
        },
        e => {
          let message = '';
          if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
            message = 'An error has occurred. Please try again later.';
          }
          swal('Error', message, 'error');
        });
      }
    }).catch(swal.noop);
  }

  public filterPlaceSets(data) {
    if (data.emptySearch) {
      this.searchedPlaceSets = this.placeSets;
    } else {
      this.searchedPlaceSets = data.value;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.poiData && changes.poiData.currentValue) {
        this.poiData = changes.poiData.currentValue;
      }
      if (changes.selectPlaceID && changes.selectPlaceID.currentValue) {
        const selectedPlace = this.placeSets.filter(place => place._id === changes.selectPlaceID.currentValue);
        this.selectPlaceSetOptions = selectedPlace && selectedPlace[0] || {};
      }
    }
  }
  public clearPlaceSet() {
    this.filterByPlaceSet.emit('');
    this.selectPlaceSetOptions = {};
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
