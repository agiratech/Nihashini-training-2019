import { Directive, OnInit, Input, ElementRef } from '@angular/core';
import {AuthenticationService} from '@shared/services';
@Directive({
  selector: '[appAccessModule]'
})
export class AccessModuleDirective implements OnInit {
  @Input() navModule: string;

  constructor(private el:  ElementRef,
              private auth: AuthenticationService) { }
  ngOnInit() {
    const ele = $(this.el.nativeElement);
    const license = this.auth.getModuleAccess(this.navModule)['status'];
    if (license === 'hidden') {
      ele.remove();
    } else if (license === 'disabled') {
      ele.addClass('module-disable');
    }
  }
}
