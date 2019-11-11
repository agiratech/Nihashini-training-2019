import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-projects-ghost',
  templateUrl: './projects-ghost.component.html',
  styleUrls: ['./projects-ghost.component.less']
})
export class ProjectsGhostComponent implements OnInit {
constructor() { }
ngOnInit() {
}
@Input() ghost:any
}
