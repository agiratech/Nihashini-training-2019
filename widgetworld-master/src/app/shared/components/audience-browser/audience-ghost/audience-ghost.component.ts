import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audience-ghost',
  templateUrl: './audience-ghost.component.html',
  styleUrls: ['./audience-ghost.component.less']
})
export class AudienceGhostComponent {
  @Input() selectionType;
}
