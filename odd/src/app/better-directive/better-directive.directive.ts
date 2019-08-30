import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appBetterDirective]'
})
export class BetterDirectiveDirective implements OnInit {

  constructor(private eleRef: ElementRef, private renderer: Renderer2) { }
OnInit() {
  this.renderer.setStyle()
}
}
