import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapDisplayOptionsComponent } from '../components/map-display-options/map-display-options.component';
import { LayersService } from '../../explore/layer-display-options/layers.service';
import { LayerPlaceSetComponent } from '../components/layer-place-set/layer-place-set.component';
import { LayerSinglePlaceComponent } from '../components/layer-single-place/layer-single-place.component';
import { LayerSpecificGeographyComponent } from '../components/layer-specific-geography/layer-specific-geography.component';
import { SharedFunctionsModule } from '../shared-functions.module';
import {PlaceCustomizeLayerComponent} from '../../places/filters/place-customize-layer/place-customize-layer.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ResizableModule } from 'angular-resizable-element';
import { AngularDraggableModule } from 'angular2-draggable';
import { CustomTextLayerComponent } from '@shared/components/custom-text-layer/custom-text-layer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import { ColorPickerModule } from '../components/color-picker/color-picker.module';
import { CustomLogoLayerComponent } from '@shared/components/custom-logo-layer/custom-logo-layer.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    FlexLayoutModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ResizableModule,
    AngularDraggableModule,
    NgxDnDModule,
    ColorPickerModule,
    MatDividerModule,
    DragDropModule,
    SharedFunctionsModule,
  ],
  declarations: [
    MapDisplayOptionsComponent,
    CustomTextLayerComponent,
    LayerPlaceSetComponent,
    LayerSinglePlaceComponent,
    LayerSpecificGeographyComponent,
    PlaceCustomizeLayerComponent,
    CustomLogoLayerComponent
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MapDisplayOptionsComponent,
    CustomTextLayerComponent,
    CustomLogoLayerComponent,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    FlexLayoutModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LayerPlaceSetComponent,
    LayerSinglePlaceComponent,
    LayerSpecificGeographyComponent,
    PlaceCustomizeLayerComponent,
    NgxDnDModule,
    ColorPickerModule,
    MatDividerModule,
    DragDropModule,
    SharedFunctionsModule
  ],
  providers: [LayersService]
})
export class LayersDisplayOptionsModule { }
