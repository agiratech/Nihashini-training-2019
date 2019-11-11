import { Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appNumberOnly]'
})
export class NumberOnlyDirective {
   // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ];
  @Input('min') MIN:any;
  @Input('max') MAX:any;
  constructor(private el: ElementRef) { }
  @HostListener('keydown', [ '$event' ])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys '-', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    /**
     * This condition is user to allow only numbers with out checking min and max values
     */
    if (!this.MIN && !this.MAX ) {
      let current: string = this.el.nativeElement.value;
      let next: string = current.concat(event.key);
      if (next && !String(next).match(this.regex)) {
        event.preventDefault();
      }
    }
    /**
     * This condition is user to allow only numbers with checking min and max values
     */
    if (this.MIN !== undefined && this.MAX !== undefined ) {
      let current: string = this.el.nativeElement.value;
      let next: string = current.concat(event.key);
      if ( Number(next) <= Number(this.MAX) && Number(next) >= Number(this.MIN)) {
        if (next && !String(next).match(this.regex)) {
          event.preventDefault();
        }
      } else {
        event.preventDefault();
      }
    }

  }
}
