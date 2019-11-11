import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacesRoutingModule } from './places.routing';
import { PlacesComponent } from './places.component';
import { SharedModule } from '@shared/shared.module';
import { D3Module } from '@d3/d3.module';
import { PlacesService, PlacesDataService, MapLegendsService } from '@shared/services';
import { PlacesFiltersService } from './filters/places-filters.service';
import { PlacesResolver } from '@shared/resolvers/places.resolver';
import { PlaceSetResolver } from '@shared/resolvers/place-set.resolver';
import { RadioButtonAutoCompleteDirective } from '../shared/directives/radio-button-autocomplete.directive';
import { PlacesDetailsSearchComponent } from './filters/places-details-search/places-details-search.component';
import { PlacesSearchComponent } from './filters/places-search/places-search.component';
import { PlacesHeaderComponent } from './places-header/places-header.component';
import { PlacesFiltersComponent } from './filters/places-filters/places-filters.component';
import { PlaceResultsComponent } from './filters/place-results/place-results.component';
import { PlaceResultGridComponent } from './filters/place-result-grid/place-result-grid.component';
import { PlacesTabularViewComponent } from './filters/places-tabular-view/places-tabular-view.component';
import { PlaceDetailsGridComponent } from './filters/place-details-grid/place-details-grid.component';
import { PlacesPopupComponent } from './places-popup/places-popup.component';
import { PlacesSetComponent } from './filters/places-set/places-set.component';
import { PlacesSingleLevelFilterComponent } from './filters/places-single-level-filter/places-single-level-filter.component';
import { PlacesDetailPopupComponent } from './places-detail-popup/places-detail-popup.component';
import { PlacesStatisticPopupComponent } from './places-statistic-popup/places-statistic-popup.component';
import { PlacesSimplePopupComponent } from './places-simple-popup/places-simple-popup.component';
import { LayerOptionsComponent } from './filters/layer-options/layer-options.component';
import { LayersDisplayOptionsModule } from '../shared/layers-display-options/layers-display-options.module';
import { RequestAuditDialogComponent } from './request-audit-dialog/request-audit-dialog.component';
import { SingleTextSuggestionComponent } from './request-audit-dialog/single-text-suggestion/single-text-suggestion.component';
import { MyPlacesFilterComponent } from './filters/my-places-filter/my-places-filter.component';
import { AuditJobsFilterComponent } from './filters/audit-jobs-filter/audit-jobs-filter.component';
import { AuditDetailsComponent } from './filters/audit-details/audit-details.component';
import { HerePlacesComponent } from './filters/here-places/here-places.component';
import { PlacesAssignjobComponent } from './filters/places-assign-job/places-assign-job.component';
import {MatStepperModule} from '@angular/material/stepper';
import {SatDatepickerModule, SatNativeDateModule} from 'saturn-datepicker';
import {MatDatepickerModule} from '@angular/material';
import { FacilityMapComponent } from './filters/facility-map/facility-map.component';
import { DisplayMapComponent } from './display-map/display-map.component';

@NgModule({
  imports: [
    CommonModule,
    PlacesRoutingModule,
    SharedModule,
    LayersDisplayOptionsModule,
    D3Module,
    MatStepperModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatDatepickerModule
  ],
  declarations: [
    PlacesComponent,
    RadioButtonAutoCompleteDirective,
    PlacesDetailsSearchComponent,
    PlacesSearchComponent,
    PlacesHeaderComponent,
    PlacesFiltersComponent,
    PlaceResultsComponent,
    PlaceResultGridComponent,
    PlacesTabularViewComponent,
    PlaceDetailsGridComponent,
    PlacesPopupComponent,
    PlacesSetComponent,
    PlacesSingleLevelFilterComponent,
    PlacesDetailPopupComponent,
    PlacesStatisticPopupComponent,
    PlacesSimplePopupComponent,
    LayerOptionsComponent,
    RequestAuditDialogComponent,
    SingleTextSuggestionComponent,
    MyPlacesFilterComponent,
    AuditJobsFilterComponent,
    AuditDetailsComponent,
    HerePlacesComponent,
    PlacesAssignjobComponent,
    FacilityMapComponent,
    DisplayMapComponent
   ],
  exports: [
    PlacesComponent,
    SharedModule,
    LayersDisplayOptionsModule,
    RadioButtonAutoCompleteDirective,
    PlacesDetailsSearchComponent,
    PlacesFiltersComponent,
    PlacesHeaderComponent,
    D3Module
  ],
  providers: [
    PlacesService,
    PlacesDataService,
    PlacesResolver,
    PlacesFiltersService,
    PlaceSetResolver,
    MapLegendsService
  ],
  entryComponents: [
    PlacesPopupComponent,
    PlacesDetailPopupComponent,
    PlacesStatisticPopupComponent,
    PlacesSimplePopupComponent,
    RequestAuditDialogComponent,
    PlacesAssignjobComponent,
    // PlacesFileuploadComponent
  ]
})
export class PlacesModule {}
