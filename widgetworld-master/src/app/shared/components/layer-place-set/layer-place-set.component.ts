import { 
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-layer-place-set',
  templateUrl: './layer-place-set.component.html',
  styleUrls: ['./layer-place-set.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerPlaceSetComponent implements OnInit {
  @Input() filteredPlacePacks;
  @Input() type;
  @Output() layer = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
  public moveLayer(layer, type, position) {
    this.layer.emit({layer: layer, type: type, position: position});
  }

}
