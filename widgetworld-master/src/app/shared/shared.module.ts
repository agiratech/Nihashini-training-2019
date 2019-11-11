import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {UserNavigationComponent} from './components/user-navigation/user-navigation.component';
import {RouterModule} from '@angular/router';
import {AuthenticateDirective} from './directives/authenticate.directive';
// import {CommonService} from '@shared/services/common.service';
import { ThemeService } from '@shared/services/theme.service';
import {ExploreService} from '@shared/services/explore.service';
import {LoaderService} from '@shared/services/loader.service';
import {TitleService} from '@shared/services/title.service';
import { InventoryService } from '@shared/services/inventory.service';
import {ShowErrorsComponent} from './components/show-errors/show-errors.component';
import {ConvertPipe} from './pipes/convert.pipe';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
//  Have to remove from shared to explore-workspaceave
// import {WorkSpaceService} from './services/work-space.service';
// --end
import {FormatService} from '@shared/services/format.service';
//  Have to remove from shared to explore-workspaceave
// import {WorkSpaceDataService} from './services/work-space-data.service';
// import {TargetAudienceService} from './services/target-audience.service';
import {ExploreSavePackageComponent} from './components/explore-save-package/explore-save-package.component';
// --end
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CanExitGuard} from './guards/can-exit.guard';
import {BreadCrumbsComponent} from './components/bread-crumbs/bread-crumbs.component';
import {MobileViewGuard} from './guards/mobile-view-guard.service';
// Have to move from shared
// import {WorkspaceDataMissingGuard} from './guards/workspace-data-missing.guard';
// --end
import {AuthenticationService} from './services/authentication.service';
import {AuthGuard} from './guards/auth.guard';
import {LoginRedirectGuard} from './guards/login-redirect.guard';
import {PlacesDataService, PlacesService} from '@shared/services';
//  Have to remove from shared to explore-workspaceave
import {AudienceBrowserComponent} from '@shared/components/audience-browser/audience-browser.component';
import {CustomizeColumnComponent} from '@shared/components/customize-column/customize-column.component';
// --end
import {MatRadioModule} from '@angular/material/radio';
import {HighlightPipe} from '@shared/pipes/highlight.pipe';
// import { GeoKeysPipe } from '../explore/pipes/geo-keys.pipe';
import {DebounceDirective} from './directives/debounce.directive';
// Have to move resolvers from shared to specific modules
// import {ProjectsResolver} from './resolvers/projects.resolver';
// import {MarketsResolver} from './resolvers/markets.resolver';
// import {DefaultAudienceResolver} from './resolvers/default-audience.resolver';
import {PlacesResolver} from './resolvers/places.resolver';
// import {PackagesResolver} from './resolvers/packages.resolver';
import {SavedCharactersPipe} from '@shared/pipes/saved-characters.pipe';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
// import {SavedAudienceResolver} from '@shared/resolvers/saved-audience.resolver';
import { TagsInputComponent } from './components/tags-input/tags-input.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {SearchDirective} from '@shared/directives/search.directive';
import { HeaderComponent } from '../layout/app-layout/header/header.component';
import {MatDividerModule} from '@angular/material/divider';
import { MatTreeModule } from '@angular/material/tree';
import { NumberFormatterDirective } from './directives/number-formatter.directive';
import {NormalizeSavedAudiencePipe} from '@shared/pipes/normalize-saved-audience.pipe';
import { SavePlaceSetsDialogComponent } from '@shared/components/save-place-sets-dialog/save-place-sets-dialog.component';
import { AudienceBrowserDialogComponent } from './components/audience-browser-dialog/audience-browser-dialog.component';
import {FiltersService} from '../explore/filters/filters.service';
import { ArrowNavigationComponent } from '@shared/components/arrow-navigation/arrow-navigation.component';
import { AudienceTitleDialogComponent } from './components/audience-title-dialog/audience-title-dialog.component';
import { SavedViewDialogComponent } from './components/saved-view-dialog/saved-view-dialog.component';
import { ApplicenseDirective } from './directives/applicense.directive';
import { LicenseDisableDirective } from './directives/license-disable.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { DropdownComponent } from './components/dropdown/dropdown.component';
// import {A11yModule} from '@angular/cdk/a11y';
// import {BidiModule} from '@angular/cdk/bidi';
// import {ObserversModule} from '@angular/cdk/observers';
import {OverlayModule} from '@angular/cdk/overlay';
// import {PlatformModule} from '@angular/cdk/platform';
// import {PortalModule} from '@angular/cdk/portal';
// import {ScrollDispatchModule} from '@angular/cdk/scrolling';
// import {CdkStepperModule} from '@angular/cdk/stepper';
// import {CdkTableModule} from '@angular/cdk/table';
import { AngularDraggableModule } from 'angular2-draggable';
import {DuplicateScenariosComponent} from '../projects/duplicate-scenarios/duplicate-scenarios.component';
import { AccessModuleDirective } from './directives/access-module.directive';
import { DynamicComponentService } from './services/dynamic-component.service';
import { MapService } from '@shared/services/map.service';
import { PlaceSetsDialogComponent } from './components/place-sets-dialog/place-sets-dialog.component';
import { NewProjectDialogComponent } from './components/new-project-dialog/new-project-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ScenarioDialogComponent } from './components/scenario-dialog/scenario-dialog.component';
import { MediaTypesFilterComponent } from './components/media-types-filter/media-types-filter.component';
import { MediaTypesBuilderDialogComponent } from './components/media-types-builder-dialog/media-types-builder-dialog.component';
import { DragDropDirective} from '@shared/directives/drag-drop.directive';
import { MapLegendsComponent } from './components/map-legends/map-legends.component';
import {SharedFunctionsModule} from './shared-functions.module';
import { DefaultPageComponent } from './components/default-page/default-page.component';
import { AudienceGhostComponent } from './components/audience-browser/audience-ghost/audience-ghost.component';
import { MarketTypeFilterComponent } from './components/market-type-filter/market-type-filter.component';
import { MarketFilterComponent } from '../explore/filters/market-filter/market-filter.component';
import { PublicSignInComponent } from './components/publicSite/sign-in-sign-up/sign-in-sign-up.component';
import { PrintViewPublicDialogComponent } from './components/publicSite/print-view-public-dialog/print-view-public-dialog.component';
import { PublicSiteRedirctGaurd } from './guards/public-site-redirect.gaurd';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    NgxDnDModule,
    MatDialogModule,
    MatBadgeModule,
    MatChipsModule,
    MatTreeModule,
    NgxMatSelectSearchModule,
    MatDividerModule,
    DragDropModule,
    MatAutocompleteModule,
    // A11yModule,
    // BidiModule,
    // ObserversModule,
    OverlayModule,
    // PlatformModule,
    // PortalModule,
    // ScrollDispatchModule,
    // CdkStepperModule,
    // CdkTableModule,
    AngularDraggableModule,
    MatSlideToggleModule,
    InfiniteScrollModule,
    SharedFunctionsModule
  ],
  declarations: [
    UserNavigationComponent,
    AuthenticateDirective,
    ShowErrorsComponent,
    ConvertPipe,
    HighlightPipe,
    SavedCharactersPipe,
    NormalizeSavedAudiencePipe,
    BreadCrumbsComponent,
    AudienceBrowserComponent,
    CustomizeColumnComponent,
    SavePlaceSetsDialogComponent,
    DebounceDirective,
    TagsInputComponent,
    SearchDirective,
    HeaderComponent,
    NumberFormatterDirective,
    ExploreSavePackageComponent,
    AudienceBrowserDialogComponent,
    ArrowNavigationComponent,
    AudienceTitleDialogComponent,
    SavedViewDialogComponent,
    DuplicateScenariosComponent,
    ApplicenseDirective,
    LicenseDisableDirective,
    NumberOnlyDirective,
    DropdownComponent,
    AccessModuleDirective,
    // GeoKeysPipe,
    PlaceSetsDialogComponent,
    NewProjectDialogComponent,
    ConfirmationDialogComponent,
    ScenarioDialogComponent,
    AutocompleteComponent,
    MediaTypesFilterComponent,
    MediaTypesBuilderDialogComponent,
    DragDropDirective,
    MapLegendsComponent,
    DefaultPageComponent,
    AudienceGhostComponent,
    MarketTypeFilterComponent,
    MarketFilterComponent,
    PublicSignInComponent,
    PrintViewPublicDialogComponent
  ],
  exports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    UserNavigationComponent,
    AuthenticateDirective,
    ShowErrorsComponent,
    ConvertPipe,
    HighlightPipe,
    SavedCharactersPipe,
    BreadCrumbsComponent,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    MatDialogModule,
    MatBadgeModule,
    MatChipsModule,
    MatTreeModule,
    MatDividerModule,
    NgxDnDModule,
    TagsInputComponent,
    AudienceBrowserComponent,
    CustomizeColumnComponent,
    SavePlaceSetsDialogComponent,
    DebounceDirective,
    NgxMatSelectSearchModule,
    SearchDirective,
    HeaderComponent,
    NumberFormatterDirective,
    ExploreSavePackageComponent,
    AudienceBrowserDialogComponent,
    ArrowNavigationComponent,
    SavedViewDialogComponent,
    DuplicateScenariosComponent,
    ApplicenseDirective,
    LicenseDisableDirective,
    NumberOnlyDirective,
    DragDropModule,
    MatAutocompleteModule,
    DropdownComponent,
    // A11yModule,
    // BidiModule,
    // ObserversModule,
    OverlayModule,
    // PlatformModule,
    // PortalModule,
    // ScrollDispatchModule,
    // CdkStepperModule,
    // CdkTableModule,
    AngularDraggableModule,
    MatSlideToggleModule,
    AccessModuleDirective,
    // GeoKeysPipe,
    InfiniteScrollModule,
    PlaceSetsDialogComponent,
    NewProjectDialogComponent,
    AutocompleteComponent,
    MediaTypesFilterComponent,
    MediaTypesBuilderDialogComponent,
    DragDropDirective,
    MapLegendsComponent,
    MarketTypeFilterComponent,
    MarketFilterComponent,
    SharedFunctionsModule,
    PublicSignInComponent
  ],
  providers: [
    AuthenticationService,
    // CommonService,
    ThemeService,
    ExploreService,
    LoaderService,
    TitleService,
    // ExploreDataService,
    // WorkSpaceService,
    FormatService,
    FiltersService,
    // WorkSpaceDataService,
    // TargetAudienceService,
    AuthGuard,
    LoginRedirectGuard,
    CanExitGuard,
    MobileViewGuard,
    // WorkspaceDataMissingGuard,
    PlacesDataService,
    PlacesService,
    PlacesResolver,
    // ProjectsResolver,
    // MarketsResolver,
    // DefaultAudienceResolver,
    // PackagesResolver,
    // SavedAudienceResolver,
    ConvertPipe,
    DynamicComponentService,
    MapService,
    InventoryService,
    PublicSiteRedirctGaurd
  ],
  entryComponents: [
    AudienceBrowserComponent,
    CustomizeColumnComponent,
    ExploreSavePackageComponent,
    SavePlaceSetsDialogComponent,
    AudienceBrowserDialogComponent,
    AudienceTitleDialogComponent,
    SavedViewDialogComponent,
    PlaceSetsDialogComponent,
    NewProjectDialogComponent,
    ScenarioDialogComponent,
    ConfirmationDialogComponent,
    DuplicateScenariosComponent,
    MediaTypesFilterComponent,
    MediaTypesBuilderDialogComponent,
    MapLegendsComponent,
    PublicSignInComponent,
    PrintViewPublicDialogComponent
  ]
})
export class SharedModule {}
