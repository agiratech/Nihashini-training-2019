import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';
import {takeWhile} from 'rxjs/operators';
import {FormatService} from '../../../shared/services/index';
import { ReplaySubject } from 'rxjs';
@Component({
  selector: 'app-places-dropdown',
  templateUrl: './places-dropdown.component.html',
  styleUrls: ['./places-dropdown.component.less']
})
export class PlacesDropdownComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private formatService: FormatService) { }
  @Input() places: any = [];
  @Input() selectedPlacesIds: any = [];
  @Output() updatePlaces: EventEmitter<any> = new EventEmitter();
  public unSubscribe = true;
  public selectedPlaceCtrl: FormControl = new FormControl();
  public placesFiltersCtrl: FormControl = new FormControl();
  public filteredPlaces: ReplaySubject<any> = new ReplaySubject<any>(1);
  @ViewChild('multiSelect', {static: false}) multiSelectDropdown;
  ngOnInit() {
    if (this.places) {
      this.places.sort(this.formatService.sortAlphabetic);
      this.filteredPlaces.next(this.places.slice());
    }
    this.placesFiltersCtrl.valueChanges
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(() => {
        this.filterBanksMulti();
      });
    this.setPlacesValue();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPlacesIds) {
      this.selectedPlacesIds =  changes.selectedPlacesIds.currentValue;
      this.setPlacesValue();
    }
  }
  setPlacesValue() {
    this.selectedPlaceCtrl.patchValue(this.selectedPlacesIds || []);
  }
  ngOnDestroy() {
    this.unSubscribe = false;
  }

  private filterBanksMulti() {
    if (!this.places) {
      return;
    }
    // get the search keyword
    let search = this.placesFiltersCtrl.value;
    if (!search) {
      this.filteredPlaces.next(this.places.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPlaces.next(
      this.places.filter(place => this.search(search, place))
    );
  }

  public clearSelection() {
    this.selectedPlaceCtrl.reset();
    this.updatePlacesIds();
  }

  public setValues() {
    this.selectedPlacesIds = this.selectedPlaceCtrl.value;
    this.updatePlacesIds();

  }
  private updatePlacesIds() {
    this.updatePlaces.emit(this.selectedPlaceCtrl.value);
    this.multiSelectDropdown.close();
  }
  private search(keyword, set) {
    let searchValue = [];
    keyword = keyword.split(' ');
    searchValue = keyword.map(key => {
      return ((set.name).toLowerCase().indexOf(key.toLowerCase()) !== -1);
    });
    if (searchValue.indexOf(true) >= 0) {
      return true;
    } else {
      return false;
    }
  }
}
