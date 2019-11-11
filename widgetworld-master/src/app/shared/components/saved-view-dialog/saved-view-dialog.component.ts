import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  ExploreService,
  FormatService,
  ThemeService
} from '@shared/services';
import { LayersService } from '../../../explore/layer-display-options/layers.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-saved-view-dialog',
  templateUrl: './saved-view-dialog.component.html',
  styleUrls: ['./saved-view-dialog.component.less']
})
export class SavedViewDialogComponent implements OnInit {
  layerSetForm: FormGroup;
  layersAll: any = [];
  constructor(public dialogRef: MatDialogRef<SavedViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private exploreService: ExploreService,
    private formatService: FormatService,
    private layersService: LayersService, private theme: ThemeService) { }
  layers: any = [];
  display: any = {};
  filters: any = {};
  public customLogo: any = {};
  savedViewName = '';
  selectedView = {};
  public isPublicSite = false;
  ngOnInit() {
    /*const themeSettings = this.theme.getThemeSettings();
    if (themeSettings.publicSite) {
      this.isPublicSite = true;
    } else {
      this.isPublicSite = false;
    }*/
    this.layersAll = this.data.layersAll;
    if (this.data.method === 'update' && this.data.selectedView) {
      this.selectedView = this.data.selectedView;
      this.savedViewName = this.selectedView['name'];
    } else {
      if (this.layersAll.length > 0) {
        this.savedViewName = this.formatService.getObjectTitle(this.layersAll, 'View', 'name');
      } else {
        this.savedViewName = 'Untitled View 1';
      }
    }
    this.layerSetForm = this.fb.group({
      'name': [this.savedViewName, Validators.required],
      'password': ['']
    });
    this.data['layers'].map( layer => {
      let data = {};
      // TODO [refactor] : Discuss with the team, why another data formatting is required here?
      // if (layer['type'] !== 'place') {
        data = {id: layer['id'], type: layer['type'], icon: layer['icon'], color: layer['color'] };
      // } else {
      //   data = layer;
      // }
      // adding Heatmap type for single inventory unit
      if (layer.type === 'geopathId') {
        data['heatMapType'] = layer['heatMapType'];
      }
      // for geography Layer save
      if (layer.type === 'geography') {
        data['geography'] = layer['geography'];
      }
      this.layers.push(data);
    });
    this.display = this.data['display'];
    this.filters = this.data['filters'];
    if (this.layersService.customLogo['logo'] && this.layersService.customLogo['logo']['location']) {
      this.customLogo['file'] = this.layersService.customLogo['logo']['location'];
      if (typeof this.customLogo['file'] === 'string') {
        this.display['logo'] = this.layersService.customLogo['logo'];
      } else {
        const logoInfo = Object.assign({}, this.layersService.customLogo['logo']);
        delete logoInfo['location'];
        delete logoInfo['url'];
        this.display['logo'] = logoInfo;
      }
    }
  }
  onSubmit(form) {
    if (!form.invalid) {
      const layers = {
        name : form.value['name'],
        layers : this.layers,
        display : this.display,
        filters: this.filters
      };
      if (this.layers && this.layers.length <= 0) {
        delete layers['layers'];
      }
      if (!this.isPublicSite) {
        if (this.data.method === "add") {
          this.exploreService.saveLayerView(layers).subscribe(
            response => {
              // const id = 1;
              if (
                this.customLogo["file"] &&
                typeof this.customLogo["file"] !== "string"
              ) {
                console.log("file", this.customLogo["file"]);
                this.exploreService
                  .uploadLogo(response["data"]["id"], this.customLogo["file"])
                  .subscribe(
                    data => {
                      this.afterApiSuccess("Layer view saved successfully.");
                    },
                    error => {
                      this.afterApiError(error);
                    }
                  );
              } else {
                this.afterApiSuccess("Layer view saved successfully.");
              }
            },
            error => {
              this.afterApiError(error);
            }
          );
        } else {
          this.exploreService
            .updateLayerView(layers, this.selectedView["_id"])
            .subscribe(
              response => {
                if (
                  this.customLogo["file"] &&
                  typeof this.customLogo["file"] !== "string"
                ) {
                  let previousLocation = "";
                  if (
                    this.selectedView["display"] &&
                    this.selectedView["display"]["logo"] &&
                    this.selectedView["display"]["logo"]["location"]
                  ) {
                    previousLocation = this.selectedView["display"]["logo"][
                      "location"
                    ];
                  }
                  this.exploreService
                    .uploadLogo(
                      this.selectedView["_id"],
                      this.customLogo["file"],
                      previousLocation
                    )
                    .subscribe(
                      data => {
                        this.afterApiSuccess(
                          "Layer view updated successfully."
                        );
                      },
                      error => {
                        this.afterApiError(error);
                      }
                    );
                } else {
                  this.afterApiSuccess("Layer view updated successfully.");
                }
              },
              error => {
                this.afterApiError(error);
              }
            );
        }
      } else {
        console.log('layers', layers);
        console.log('form', form);
      }
    }
  }

  private afterApiSuccess(message) {
    this.dialogRef.close();
    swal('Success', message, 'success');
    this.exploreService.getLayerViews().subscribe(saveData => {
      const savedViews = saveData && saveData.views && saveData.views || [];
      this.exploreService.setSavedLayes(savedViews);
    });
  }

  private afterApiError(error) {
    if (error.error.message) {
      this.layerSetForm.controls['name'].setErrors({ 'error': error.error.message });
    } else {
      swal('Something went wrong');
    }
  }
}
