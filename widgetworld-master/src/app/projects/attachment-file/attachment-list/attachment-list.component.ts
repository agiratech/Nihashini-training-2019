import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { UploadAttachments } from '@interTypes/uploadAttachments';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { trigger } from '@angular/animations';
import { fadeIn, fadeOut } from '../animation/fade-animation';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialog } from '@interTypes/workspaceV2';
import { tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeOut', fadeOut()),
    trigger('fadeIn', fadeIn())
  ],
})

export class AttachmentListComponent implements OnInit, AfterViewChecked {
  @Input() public attachmentFile: UploadAttachments[] = [];
  @Output() uploadList: EventEmitter<any> = new EventEmitter();
  @Input() public projectId;
  public attLength;
  public listAttachments: any = [];
  ghost = [];

  constructor(private http: HttpClient,
    private workSpace: NewWorkspaceService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.ghostAnimation();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ghostAnimation() {
    this.ghost = new Array(5);
    this.workSpace.getProject(this.projectId)
      .pipe(tap(() => this.ghost = []))
      .subscribe(response => {
        this.listAttachments = response['attachments'];
    });
  }

  onDeleteAttachment(key, attName, attId) {
    const width = '586px';
    const height = '230px';
    const data: ConfirmationDialog = {
      notifyMessage: false,
      confirmTitle: 'Delete ' + attName + '?',
      confirmDesc: 'Are you sure you want to delete ' + attName + '?',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width,
      height: height
    }).afterClosed().subscribe(res => {
      if (res && res['action']) {
        this.workSpace.deleteAttachment(this.projectId, key).subscribe(response => {
            response.message = 'Attachment Deleted Successfully!';
            this.onOpenConfirmation(response, attId);
        });
      }
    });
  }

  onOpenConfirmation (res, attId, error = false) {
    const width = '586px';
    const data: ConfirmationDialog = {
      messageText: res.message,
      notifyMessage: true
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(result => {
      if (result && !error) {
        this.listAttachments = this.listAttachments.filter(att => att._id !== attId);
      }
    });
  }

  downloadFile(name, url) {
    saveAs(url, name);
  }
}
