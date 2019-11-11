import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {ExploreWorkspaceSharedModule} from '@shared/explore-workspace-shared.module';
import {MarketPlanService} from './market-plan.service';

import {ScenariosRouting} from './scenarios.routing';
import {ScenariosComponent} from './scenarios.component';
import {ScenarioCreateComponent} from './scenario-create/scenario-create.component';
import {ScenarioViewComponent} from './scenario-view/scenario-view.component';

import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatMenuModule} from '@angular/material/menu';
import { PlacesDropdownComponent } from './places-dropdown/places-dropdown.component';
import { ScenarioFiltersComponent } from './scenario-filters/scenario-filters.component';
import { ScenariosInventoriesComponent } from './scenarios-inventories/scenarios-inventories.component';
import { ScenariosInventoryListComponent } from './scenarios-inventory-list/scenarios-inventory-list.component';
import { ScenarioPlacesComponent } from './scenario-places/scenario-places.component';
import { DisableSortPipe } from './pipes/disable-sort.pipe';
import { CSVService } from '@shared/services';
import { ConvertPipe } from '@shared/pipes/convert.pipe';
import {ProjectResolver} from './resolvers/project.resolver';
import {ScenarioResolver} from './resolvers/scenario.resolver';
import { ScenarioMediaTypesComponent } from './scenario-media-types/scenario-media-types.component';
import { VerticalSelectComponent } from './vertical-select/vertical-select.component';
import { MyPlanComponent } from './my-plan/my-plan.component';
import { FiltersComponent } from './filters/filters.component';
import { FilterOptionsComponent } from './filter-options/filter-options.component';
import { MarketTypesListComponent } from './market-types-list/market-types-list.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MediatypeInnerListComponent } from './mediatype-inner-list/mediatype-inner-list.component';
import { GoalsDetailsComponent } from './goals-details/goals-details.component';
import { ProjectsAttachmentComponent } from '../attachment-file/projects-attachment/projects-attachment.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ExploreWorkspaceSharedModule,
    ScenariosRouting,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatButtonToggleModule
  ],
  declarations: [
    ScenariosComponent,
    ScenarioCreateComponent,
    ScenarioViewComponent,
    PlacesDropdownComponent,
    ScenarioFiltersComponent,
    ScenariosInventoriesComponent,
    ScenariosInventoryListComponent,
    ScenarioPlacesComponent,
    DisableSortPipe,
    ScenarioMediaTypesComponent,
    VerticalSelectComponent,
    MyPlanComponent,
    FiltersComponent,
    FilterOptionsComponent,
    MarketTypesListComponent,
    MediatypeInnerListComponent,
    GoalsDetailsComponent
  ],
  exports: [
    SharedModule,
    ExploreWorkspaceSharedModule,
    DisableSortPipe
  ],
  providers: [
    CSVService,
    ConvertPipe,
    ProjectResolver,
    ScenarioResolver,
    MarketPlanService,
  ],
  entryComponents: [
    FilterOptionsComponent
  ]
})
export class ScenariosModule {}
