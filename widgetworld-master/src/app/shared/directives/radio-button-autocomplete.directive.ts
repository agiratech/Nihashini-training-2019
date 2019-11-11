import {Directive, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer} from '@angular/core';
import {PlacesDataService} from '@shared/services';
import {takeWhile} from 'rxjs/operators';

@Directive({
  selector: '[appRadioButtonAutocomplete]',
})
export class RadioButtonAutoCompleteDirective implements OnInit, OnChanges {
  @Input() filter: string;
  @Input() sourceData: any;
  sourceDataBackup: any;
  selectedCategoryName: any;
  arrowKeyPosition = { market: 0, operator: 0};
  arrowKeyPlacePosition = {place: 0 };
  private unSubscribe = true;
  public categories = [];
  constructor(
    private el: ElementRef,
    private r: Renderer,
    private placeDataSevice: PlacesDataService
   ) {
  }
  ngOnInit() {
    this.sourceDataBackup = this.sourceData;

    this.placeDataSevice.getHighlightedPosition().subscribe(position => {
      this.arrowKeyPlacePosition.place = position.place;
    });


    this.placeDataSevice.getPlacesCategory().pipe(takeWhile(() => this.unSubscribe)).subscribe(categoryObject => {
      this.categories = categoryObject;
    });
    this.placeDataSevice.getSelectedCategoryName().subscribe(categoryName => {
      this.selectedCategoryName = categoryName;
    });
  }
  @HostListener('keyup', ['$event']) onChange(event: KeyboardEvent) {

    if (this.filter === 'places') {
      if ((event.keyCode >= this.placeDataSevice.keyCodes.LEFTARROW && event.keyCode <= this.placeDataSevice.keyCodes.DOWNARROW)
      || event.keyCode === this.placeDataSevice.keyCodes.ENTER ) {
        return true;
      }
      if (this.el.nativeElement.value.length > 0) {
        this.sourceData = this.sourceDataBackup;
        this.placeDataSevice.setPlacesCategory(this.sourceData.filter(
          (option) => option.name.toLowerCase().indexOf(this.el.nativeElement.value.toLowerCase()) > -1));
        setTimeout(() => {
          let currentCategory;
          this.placeDataSevice.getPlacesCategory().subscribe(
            res => {currentCategory = res; }
          );
          const selectedOptioin = currentCategory.filter((category) => category.name === this.selectedCategoryName);
          if (selectedOptioin.length >= 0 ) {
            const elements = [].slice.call(document.querySelectorAll('#place-category ul li.active-position'));
            elements.map((element) => element.classList.remove('active-position'));
            if (this.sourceData.length > 0) {
              let element: any;
              element  = <HTMLElement> document.querySelector('#place-category ul li');
              if (element) {
                element.classList.add('active-position');
                element = element.querySelector('input');
                element.click();
              }
            }
          }
        }, 100);
      } else {
        this.placeDataSevice.setPlacesCategory(this.sourceDataBackup);
        if (this.placeDataSevice.getPlacesSession().filters['category']) {
          this.placeDataSevice.setSelectedCategoryName(this.placeDataSevice.getPlacesSession().filters['category'].name);
        }
        setTimeout(() => {
          const index = this.categories.findIndex(record => record.name.toLowerCase() === this.selectedCategoryName.toLowerCase());
          this.arrowKeyPlacePosition.place = index + 1;
          this.placeDataSevice.setHighlightedPosition(this.arrowKeyPlacePosition);
            $('#category_' + index).click();
        }, 100);
      }
    }
  }
  @HostListener('window:keydown', ['$event'])
  marketListNavigation(event: KeyboardEvent) {
    if ($('#place-category .place-search').val() !== undefined) {
      if ($('#place-category .place-search').val().length >= 0) {
        if (event.keyCode === this.placeDataSevice.keyCodes.UPARROW) {
          // arrow up case
          event.preventDefault();
          event.stopPropagation();
          if (this.arrowKeyPlacePosition.place > 0 && this.arrowKeyPlacePosition.place !== 1) {
            this.arrowKeyPlacePosition.place = --this.arrowKeyPlacePosition.place;
            this.placeDataSevice.setHighlightedPosition(this.arrowKeyPlacePosition);
            $('#category_' + (this.arrowKeyPlacePosition.place - 1)).click();
            $('#category_' + (this.arrowKeyPlacePosition.place - 1)).focus();
          } else {
            this.arrowKeyPlacePosition.place = this.categories.length;
            this.placeDataSevice.setHighlightedPosition(this.arrowKeyPlacePosition);
            $('#category_' + (this.categories.length - 1)).click();
            $('#category_' + (this.categories.length - 1)).focus();
          }
        } else if (event.keyCode === this.placeDataSevice.keyCodes.DOWNARROW) {
          // arrow down
          event.preventDefault();
          event.stopPropagation();
          if (this.arrowKeyPlacePosition.place < this.categories.length) {
            this.arrowKeyPlacePosition.place = ++this.arrowKeyPlacePosition.place;
            this.placeDataSevice.setHighlightedPosition(this.arrowKeyPlacePosition);
            $('#category_' + (this.arrowKeyPlacePosition.place - 1)).click();
            $('#category_' + (this.arrowKeyPlacePosition.place - 1)).focus();
          } else {
            this.arrowKeyPlacePosition.place = 1;
            this.placeDataSevice.setHighlightedPosition(this.arrowKeyPlacePosition);
            $('#category_0').click();
            $('#category_0').focus();
          }
        }
      }
    }
  }

  @HostListener('window:keydown.enter', ['$event']) submitMarket(event: KeyboardEvent) {
    if ($('#place-category .place-search')) {
      if ($('#place-category .place-search').length > 0) {
        if (this.categories.length === 1) {
          $('#category_0').click();
        } else if (this.arrowKeyPlacePosition.place > 0) {
          $('#category_' + (this.arrowKeyPlacePosition.place - 1)).click();
        }
        $('#place-category .category-submit').click();
      }
    }
  }
  ngOnChanges() {
    if (this.sourceDataBackup && this.sourceDataBackup.length === 0) {
      this.sourceDataBackup = this.sourceData;
    }
  }
}
