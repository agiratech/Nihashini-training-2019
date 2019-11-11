import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { DragDropDirective} from '@shared/directives/drag-drop.directive';

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.less']
})
export class UploadListComponent implements OnInit, OnChanges {
  @Output() uploadSubmit = new EventEmitter;
  @Output() cancelSubmit = new EventEmitter;
  constructor() { }
  public fileName = '';
  public dropFileName = '';
  private fileData: any = [] ;
  public fileValidationText = '';
  public files: any = [];
  @Input() public clearField;
  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.clearField.currentValue) {
      this.clearAttachment();
    }
  }

  public updateAttachment(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      const file = event.target.files[0];
      if (['application/pdf', 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword' ].includes(file.type)) {
        if (file.size < (1024 * 1024) * 10) {
          this.fileValidationText = '';
          reader.onload = (e: any) => {
            const formData = new FormData();
            formData.append('attachment', event.target.files[0]);
            this.fileName = event.target.files[0].name;
            this.setFileInfo({fileFormData: formData, url: e.target.result, fileName: this.fileName, fileType: file.type});
          };
          reader.readAsDataURL(event.target.files[0]);
        } else {
          this.fileValidationText = 'File size should be less than 10MB';
        }
      } else {
        this.fileValidationText = 'File format should be any of pdf/txt/docx/doc';
      }
    }
  }

  private setFileInfo(data) {
    this.fileData.push(data);
  }

  public onSubmitFile() {
    if (this.fileName || this.dropFileName) {
      this.uploadSubmit.emit(this.fileData);
    } else {
      this.fileValidationText = 'Please choose any attachment';
    }
  }

  uploadFile(event) {
    const reader = new FileReader();
    const file = event[0];
    if (['application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword' ].includes(file.type)) {
      if (file.size < (1024 * 1024) * 10) {
        this.fileValidationText = '';
        reader.onload = (e: any) => {
          const formData = new FormData();
          formData.append('attachment', file);
          this.dropFileName = file.name;
          this.setFileInfo({fileFormData: formData, url: '', fileName: this.dropFileName, fileType: file.type});
        };
        reader.readAsDataURL(file);
      } else {
        this.fileValidationText = 'File size should be less than 10MB';
      }
      for (let index = 0; index < event.length; index++) {
        const element = event[index];
        this.files.push(element.name);
      }
    } else {
      this.fileValidationText = 'File format should be any of pdf/txt/docx/doc';
    }

  }

  deleteAttachment(index) {
    this.files.splice(index, 1);
  }

  onCancelUpload() {
    this.clearAttachment();
    this.cancelSubmit.emit();
  }

  clearAttachment() {
    this.files = [];
    this.fileName = '';
    this.dropFileName = '';
  }
}
