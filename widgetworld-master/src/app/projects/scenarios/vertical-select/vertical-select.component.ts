import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
export interface Option {
  label: any;
  value: any;
}
@Component({
  selector: 'app-vertical-select',
  templateUrl: './vertical-select.component.html',
  styleUrls: ['./vertical-select.component.less'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => VerticalSelectComponent),
    multi: true
  }]
})
export class VerticalSelectComponent implements OnInit, ControlValueAccessor {
  @Input() options: Option[];
  @Input() _selected: string | number;
  propagateChange = (_: any) => {};
  ngOnInit() {}
  writeValue(value: string | number): void {
    if (value !== undefined) {
      this.selected = value;
    }
  }
  registerOnChange(fn) {
    this.propagateChange = fn;
  }
  select(value) {
    this.selected = value;
    this.propagateChange(this.selected);
  }
  registerOnTouched() {}
  get selected() {
    return this._selected;
  }
  set selected(val) {
    this._selected = val;
    this.propagateChange(this._selected);
  }

}
