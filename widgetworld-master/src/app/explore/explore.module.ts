import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import {Ng5SliderModule} from 'ng5-slider';
import {ExploreComponent} from './explore.component';
import {ExploreRouting} from './explore.routing';
import {SharedModule} from '@shared/shared.module';
import { ExploreWorkspaceSharedModule} from '@shared/explore-workspace-shared.module';
import {ExploreMetricsComponent} from './explore-metrics/explore-metrics.component';
import {ExploreLegendsComponent} from './explore-legends/explore-legends.component';
import {ExploreTabularPanelsComponent} from './explore-tabular-panels/explore-tabular-panels.component';
import {BoardTypePipe} from './pipes/board-type.pipe';
import {DirectionPipe} from './pipes/directon.pipe';
import {FeetToInchesPipe} from './pipes/feet-to-inches.pipe';
import {ExploreSidePanelComponent} from './explore-side-panel/explore-side-panel.component';
import { ResizableModule } from 'angular-resizable-element';
import { ExploreSaveScenariosComponent } from './explore-save-scenarios/explore-save-scenarios.component';
import { ExploreFiltersComponent } from './filters/explore-filters/explore-filters.component';
import { ExploreHeaderComponent } from './explore-header/explore-header.component';
import { OperatorFilterComponent } from './filters/operator-filter/operator-filter.component';
import { ExploreInventorySetsComponent } from './filters/explore-inventory-sets/explore-inventory-sets.component';
import { ExploreScenariosComponent } from './filters/explore-scenarios/explore-scenarios.component';
import { FilterByIdsComponent } from './filters/filter-by-ids/filter-by-ids.component';
import { ExploreLayersComponent } from './layer-display-options/explore-layers/explore-layers.component';
import { DisplayOptionsComponent } from './layer-display-options/display-options/display-options.component';
import { ExploreCustomizeLayersComponent } from './layer-display-options/explore-customize-layers/explore-customize-layers.component';
import {LayersService} from './layer-display-options/layers.service';
import { ExploreFilterPillsComponent } from './filters/explore-filter-pills/explore-filter-pills.component';
import { MediaAttributesComponent } from './filters/media-attributes/media-attributes.component';
import { ExploreTopZipMarketComponent } from './explore-top-zip-market/explore-top-zip-market.component';
import { LoadSaveViewComponent } from './layer-display-options/load-save-view/load-save-view.component';
import { ActionsFilterComponent } from './layer-display-options/actions-filter/actions-filter.component';
import {ThresholdsFilterComponent} from './filters/thresholds-filter/thresholds-filter.component';
import { TagsInputIdsDialogComponent } from './tags-input-ids-dialog/tags-input-ids-dialog.component';
import { TagsInputIdsTableComponent } from './tags-input-ids-table/tags-input-ids-table.component';
import { D3Module } from '@d3/d3.module';
import { ColorPickerModule } from '../shared/components/color-picker/color-picker.module';
import {CSVService} from '../shared/services/csv.service';
//import { NumberOnlyDirective } from '@shared/directives/number-only.directive';
import { ExploreInventoryDetailComponent } from './explore-inventory-popup/explore-inventory-detail/explore-inventory-detail.component';
import { ExploreInventoryIntersetComponent } from './explore-inventory-popup/explore-inventory-interset/explore-inventory-interset.component';
import { InventoryDetailViewComponent } from './explore-inventory-popup/inventory-detail-view/inventory-detail-view.component';
import { ExploreInventoryInformationComponent } from './explore-inventory-popup/explore-inventory-information/explore-inventory-information.component';
import { InventoryBulkExportComponent } from './inventory-bulk-export/inventory-bulk-export.component';
import {ThresholdsFilterGPComponent} from './filters/thresholds-filter-gp/thresholds-filter-gp.component';
import { OperatorNamePipe } from './pipes/operator-name.pipe';
import { InventoryDetailViewLayoutComponent } from './explore-inventory-popup/inventory-detail-view-layout/inventory-detail-view-layout.component';
import { MapLegendsService } from '@shared/services/map-legends.service';
import { InventoryMapDetailComponent } from './explore-inventory-popup/inventory-map-detail/inventory-map-detail.component';
@NgModule({
  imports: [
    CommonModule,
    ExploreRouting,
    SharedModule,
    ExploreWorkspaceSharedModule,
    ResizableModule,
    Ng5SliderModule,
    D3Module,
    CdkTableModule,
    CdkTreeModule,
    ColorPickerModule,
  ],
  declarations: [
    ExploreComponent,
    ExploreMetricsComponent,
    ExploreLegendsComponent,
    ExploreTabularPanelsComponent,
    ExploreSidePanelComponent,
    BoardTypePipe,
    DirectionPipe,
    FeetToInchesPipe,
    ExploreSaveScenariosComponent,
    ExploreFiltersComponent,
    ExploreHeaderComponent,
    ExploreScenariosComponent,
    FilterByIdsComponent,
    OperatorFilterComponent,
    ExploreInventorySetsComponent,
    ExploreLayersComponent,
    DisplayOptionsComponent,
    ExploreCustomizeLayersComponent,
    ExploreFilterPillsComponent,
    MediaAttributesComponent,
    ExploreTopZipMarketComponent,
    LoadSaveViewComponent,
    ActionsFilterComponent,
    ThresholdsFilterComponent,
    TagsInputIdsDialogComponent,
    TagsInputIdsTableComponent,
    //NumberOnlyDirective,
    ExploreInventoryDetailComponent,
    ExploreInventoryIntersetComponent,
    InventoryDetailViewComponent,
    ExploreInventoryInformationComponent,
    InventoryBulkExportComponent,
    ThresholdsFilterGPComponent,
    OperatorNamePipe,
    InventoryDetailViewLayoutComponent,
    InventoryMapDetailComponent
  ],
  exports: [
    ExploreComponent,
    SharedModule,
    ExploreWorkspaceSharedModule,
    D3Module,
    ColorPickerModule,
    //NumberOnlyDirective
  ],
  providers: [
    LayersService,
    CSVService,
    MapLegendsService
  ],
  entryComponents: [
    ExploreSaveScenariosComponent,
    TagsInputIdsDialogComponent,
    ExploreInventoryDetailComponent,
    ExploreInventoryIntersetComponent,
    InventoryDetailViewComponent,
    InventoryDetailViewLayoutComponent,
    InventoryMapDetailComponent,
    ExploreInventoryInformationComponent,
    InventoryBulkExportComponent,
    
  ]
})
export class ExploreModule { }
