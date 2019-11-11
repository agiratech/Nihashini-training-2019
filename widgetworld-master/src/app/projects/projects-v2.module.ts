import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ProjectsV2Routing } from './projects-v2.routing';
import { ProjectsV2Component } from './projects-v2.component';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { ProjectsViewComponent } from './projects-view/projects-view.component';
import { SubProjectCardComponent } from './sub-project-card/sub-project-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { MarketPlanListComponent } from './market-plan-list/market-plan-list.component';
import { ScenarioListComponent } from './scenario-list/scenario-list.component';

import { AttachmentListComponent } from './attachment-file/attachment-list/attachment-list.component';
import { UploadListComponent } from './attachment-file/upload-list/upload-list.component';
import { GhostListComponent } from './attachment-file/attachment-list/ghost-list/ghost-list.component';
import { ProjectsAttachmentComponent } from './attachment-file/projects-attachment/projects-attachment.component';

import { PlanOptionsComponent } from './plan-options/plan-options.component';
import { ProjectsGhostComponent } from './projects-list/projects-ghost/projects-ghost.component';
import { CampaignTabularViewComponent } from './campaign-tabular-view/campaign-tabular-view.component';
// import { DuplicateScenariosComponent } from '../projects/scenarios/duplicate-scenarios/duplicate-scenarios.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProjectsV2Routing
  ],
  declarations: [
    ProjectsV2Component,
    ProjectsListComponent,
    ProjectsViewComponent,
    SubProjectCardComponent,
    ProjectCardComponent,
    MarketPlanListComponent,
    ScenarioListComponent,
    AttachmentListComponent,
    UploadListComponent,
    GhostListComponent,
    ProjectsAttachmentComponent,
    PlanOptionsComponent,
    ProjectsGhostComponent,
    CampaignTabularViewComponent,
    // DuplicateScenariosComponent
  ],
  entryComponents: [
    // DuplicateScenariosComponent
    ProjectsAttachmentComponent
  ],
  exports: [SharedModule]
})
export class ProjectsV2Module {}
