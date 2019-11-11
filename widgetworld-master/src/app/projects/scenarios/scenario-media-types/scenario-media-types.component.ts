import {
  Component, OnInit,
  ChangeDetectorRef, Output, EventEmitter, Input
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MediaTypesBuilderDialogComponent } from '@shared/components/media-types-builder-dialog/media-types-builder-dialog.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-scenario-media-types',
  templateUrl: './scenario-media-types.component.html',
  styleUrls: ['./scenario-media-types.component.less'],
})
export class ScenarioMediaTypesComponent implements OnInit {
  @Input() public mediaTypeSelectedData = [];
  @Input() public source;
  public mediaTypesDataStatus: Boolean = false;
  @Output() selectedMediaTypes = new EventEmitter();
  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
  }

  createMediaType(mediaTypeData?, index?) {
    const dialogRef = this.matDialog.open(MediaTypesBuilderDialogComponent, {
      data: {status: true, editData: mediaTypeData, index: index }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.mediaTypeSelectedData === undefined) {
          this.mediaTypeSelectedData = [];
        }
        if (result.data && result.data.state && result.data.state === 'individual') {
          if (result.data.ids) {
            if (result.data.ids.medias) {
              const medias = result.data.ids.medias;
              medias.map(media => {
                if (!this.mediaTypeSelectedExitsOrNot(media)) {
                  const mediaData = JSON.parse(JSON.stringify(result.data));
                  mediaData.data = media;
                  mediaData.ids.medias = [media];
                  mediaData.ids.environments = [];
                  this.mediaTypeSelectedData.push(mediaData);
                }
              });
              this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
            }
            if (result.data.ids.environments) {
              const environments = result.data.ids.environments;
              environments.map(env => {
                if (!this.mediaTypeSelectedExitsOrNot(env)) {
                  const envData = JSON.parse(JSON.stringify(result.data));
                  envData.data = env;
                  envData.ids.environments = [env];
                  envData.ids.medias = [];
                  this.mediaTypeSelectedData.push(envData);
                }
              });
              this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
            }
          }
        } else if (!this.mediaTypeSelectedExitsOrNot(result.data.data)) {
          if (result.data.edit) {
              if (result.data.data === '') {
                this.mediaTypeSelectedData.splice(result.data.index, 1);
              } else {
                this.mediaTypeSelectedData[result.data.index] = result.data;
              }
              this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
            } else {
              this.mediaTypeSelectedData.push(result.data);
              this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
            }
        } else {
          swal('warning', 'Media type already exits', 'warning');
        }
      }
    });
  }

  /* checking whether media types exits or not */
  mediaTypeSelectedExitsOrNot(mediaName) {
    let mactingMediaType = false;
    this.mediaTypeSelectedData.forEach((data) => {
      if (data.data === mediaName) {
        return mactingMediaType = true;
      }
    });
    return mactingMediaType;
  }

  /* Deleting the media types */
  deleteMediaTypeCard(index) {
    if (this.source === 'markettype') {
      swal({
        title: 'Are you sure you want to delete this media type ?',
        text: '',
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: 'NO',
        confirmButtonText: 'YES, DELETE',
        confirmButtonClass: 'waves-effect waves-light',
        cancelButtonClass: 'waves-effect waves-light'
      }).then((data) => {
        if (data.value) {
          this.mediaTypeSelectedData.splice(index, 1);
          this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
        }
      });
    } else {
      this.mediaTypeSelectedData.splice(index, 1);
      this.selectedMediaTypes.emit(this.mediaTypeSelectedData);
    }
  }
}

