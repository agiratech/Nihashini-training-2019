import { Component, OnInit } from '@angular/core';
import { TitleService } from '@shared/services';
import {NewWorkspaceService} from './new-workspace.service';

@Component({
  selector: 'app-projects-v2',
  templateUrl: './projects-v2.component.html',
  styleUrls: ['./projects-v2.component.less']
})
export class ProjectsV2Component implements OnInit {
  constructor(private titleService: TitleService,
              private workspace: NewWorkspaceService) {}

  ngOnInit() {
    const labels = this.workspace.getLabels();
    this.titleService.updateTitle(labels['project'][1]);
  }
}
