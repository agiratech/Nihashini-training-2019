import {Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER, SEMICOLON, SPACE} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-tags-input',
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.less']
})
export class TagsInputComponent implements OnInit, OnChanges {
  @Input() placeholder: string = null;
  @Input() class: string = null;
  @Input() chips: Array<string>;
  @Input() invalidChips: any;
  @Input() form: Boolean = false;
  @Input() editable: Boolean = false;
  @Input() exploreFilters: Boolean = false;
  @Input() removedInvalidChipsStatus: Boolean = false;
  @Input() numberOnly: Boolean = false;
  @Input() keysCodes: number[];
  @Output() enableEdit = new EventEmitter();
  @Input() type: string;
  @Output() clearUnitIds = new EventEmitter();

  public separatorKeysCodes: number[];
  constructor() { }

  ngOnInit() {
    this.separatorKeysCodes = (this.keysCodes) ? this.keysCodes : [ENTER, COMMA, SEMICOLON, SPACE];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.removedInvalidChipsStatus  && changes.removedInvalidChipsStatus.currentValue) {
      this.removingInvalidIds();
    }
  }

  /* removing invalid Ids from mat-chip */
  removingInvalidIds() {
    if (this.removedInvalidChipsStatus) {
      if (this.invalidChips && this.invalidChips.data.length > 0) {
        // removing invalid from both GeoPanelIds and plantUnitIds
        this.invalidChips.data.map(String).filter((ids) => {
          this.remove(ids);
        });
       }
    }
  }

  /* checking for invalid Ids */
  checkingInvalidChips(chip: any) {
    if (this.invalidChips) {
      const Ids = (typeof chip !== 'string') ? JSON.parse(chip) : chip;
      const invalidChipsData = this.invalidChips.data.map(String);
      for (let i = 0; i < this.invalidChips.data.length; i++) {
        if (Ids === invalidChipsData[i]) {
          return true;
        }
      }
    }
    return false;
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const data = event.value;
    if ((data || '').trim() && this.chips.indexOf(data) === -1) {
      this.chips.push(data.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(fruit): void {
    const index = this.chips.indexOf(fruit);

    if (index >= 0) {
      this.chips.splice(index, 1);
    }
  }
  paste(event: ClipboardEvent): void {
    event.preventDefault(); // Prevents the default action
    if (this.numberOnly) {
      event.clipboardData
      .getData('Text') // Gets the text pasted
      .split(/\s*,| |\n|\r\n|\t\s*/) // Splits it when a SEMICOLON or COMMA or NEWLINE
      .forEach(value => {
        const isNUM = /^\d+$/.test(value);
        if (value.trim() &&  isNUM && this.chips.indexOf(value) === -1 ) {
          this.chips.push(value); // Push if valid
        }
      });
    } else {
      event.clipboardData
      .getData('Text') // Gets the text pasted
      .split(/\s*,| |\n|\r\n|\t\s*/) // Splits it when a SEMICOLON or COMMA or NEWLINE
      .forEach(value => {
        if (value.trim() && this.chips.indexOf(value) === -1) {
          this.chips.push(value); // Push if valid
        }
      });
    }
  }
  onEnableEdit() {
    this.enableEdit.emit(this.editable);
  }

  onFocus(name) {
    this.clearUnitIds.emit(name);
  }
}
