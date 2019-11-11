import { style, animate, transition } from '@angular/animations';
export function fadeIn() {
  return [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('400ms ease-out', style({
        opacity: 1,
      }))
    ])
  ];
}
export function fadeOut() {
  return [
    transition(':leave', [
      style({ opacity: 1 }),
      animate(300, style({
        opacity: 0
      }))
    ])
  ];
}