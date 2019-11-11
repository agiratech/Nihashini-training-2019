import {Component, EventEmitter, OnInit, ViewChild, ElementRef, Inject, HostListener, Input, Output} from '@angular/core';
import {
  ExploreDataService,
  AuthenticationService
} from '@shared/services';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import {ExploreTabularPanelsComponent} from '../../../explore/explore-tabular-panels/explore-tabular-panels.component';
@Component({
  selector: 'app-customize-column',
  templateUrl: './customize-column.component.html',
  styleUrls: ['./customize-column.component.less'],
})
export class CustomizeColumnComponent implements OnInit {
  behaviorOption: any = {};
  @Output() tabularLoad = new EventEmitter();
  public sortables: any = [];
  public currentSortables = [];
  public displaySortables = [];
  public selectedColumns = [];
  public isControlKey = false;
  public origin;
  public keyCodes = {
    CONTROL: 17,
    COMMAND: 91
  };
  public constructor(
    private _eDataService: ExploreDataService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CustomizeColumnComponent>,
    @Inject(MAT_DIALOG_DATA) private injectedData: any = [],
    private auth: AuthenticationService) {
  }

  public ngOnInit() {
    if (this.injectedData.sortables) {
      this.sortables = this.injectedData.sortables;
      this.setTopSelect();
    }
    if (this.injectedData.currentSortables) {
      this.currentSortables = this.injectedData.currentSortables;
    }
    this.origin = this.injectedData.origin;
  }

  setTopSelect() {
    if (this.sortables.length !== 0 ) {
      this.selectedColumns = [];
      this.selectedColumns.push(this.sortables[0]['displayname']);
    }
  }

  handleSelection(event) {
    if (event.option.selected) {
        if (!this.isControlKey) {
          event.source.deselectAll();
          event.option.selected = true;
          event.source.selectedOptions._multiple = false;
        } else {
          event.source.selectedOptions._multiple = true;
        }
    }
  }
  @HostListener('click', ['$event'])
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])
  customColumnSelect(event: KeyboardEvent) {
    if (event.ctrlKey || (event.key && event.key.toLowerCase() === 'meta')) {
    this.isControlKey = true;
    } else {
      this.isControlKey = false;
    }
  }

  moveColumns() {

    // const selectValue  =  $('#lstBox1').val();
    const selectValue  =  this.selectedColumns;
      for (let i = 0; i < selectValue.length ; i++) {
        const sortableValue = this.searchArray(selectValue[i], this.sortables);
        this.currentSortables.push(sortableValue);
      }
      for (let j = 0; j < selectValue.length ; j++) {
        const sortableKey = this.isExist(selectValue[j], this.sortables);
        this.sortables.splice(sortableKey, 1);
      }
    if (selectValue.length === 0) {
        swal('Nothing to move. You have to choose something from left column.');
        // e.preventDefault();
    }
    this.setTopSelect();
  }

  saveCustomColumns() {
    this.dialogRef.close({'currentSortables': this.currentSortables, 'action': 'saved'});
   }

  cancelCustomColumns() {
    this.dialogRef.close({'currentSortables': this.currentSortables, 'clear': true, 'action': 'cancel'});
  }

  searchArray(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].displayname === nameKey) {
        return myArray[i];
      }
    }
  }

  isExist(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].displayname === nameKey) {
        return i;
      }
    }
  }

  removeDuplicates(a, b) {
    for (let i = 0, len = a.length; i < len; i++) {
      for (let j = 0, len2 = b.length; j < len2; j++) {
        if (a[i].name === b[j].name) {
            b.splice(j, 1);
            len2 = b.length;
          }
      }
    }
  }

  removeFilter(idx, name) {
    const sortableValue = this.searchArray(name, this.currentSortables);
    this.sortables.push(sortableValue);
    this.currentSortables.splice(idx, 1);
    if (this.origin === 'explore') {
      localStorage.setItem('exploreCustomColumn', JSON.stringify(this.currentSortables));
      this._eDataService.saveCustomizedColumns(this.currentSortables);
    }
    if (this.origin === 'scenario') {
      localStorage.setItem('scenarioCustomColumn', JSON.stringify(this.currentSortables));
      this._eDataService.saveCustomizedColumns(this.currentSortables);
    }

    this.setTopSelect();
 }
}
