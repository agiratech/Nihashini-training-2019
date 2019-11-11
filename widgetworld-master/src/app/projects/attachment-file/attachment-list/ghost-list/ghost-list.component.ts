import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ghost-list',
  templateUrl: './ghost-list.component.html',
  styleUrls: ['./ghost-list.component.less']
})
export class GhostListComponent implements OnInit {
  @Input() ghost: any[];
  @Input() public attachments: any[];
  constructor() { }

  ngOnInit() {
  }

}
