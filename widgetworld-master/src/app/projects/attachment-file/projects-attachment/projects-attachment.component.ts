import { Component, OnInit, Inject, ChangeDetectionStrategy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { UploadAttachments } from '@interTypes/uploadAttachments';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { IntAttachments, ConfirmationDialog} from '@interTypes/workspaceV2';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import {ConfirmationDialogComponent} from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { zip } from 'rxjs';
@Component({
  selector: 'app-projects-attachment',
  templateUrl: './projects-attachment.component.html',
  styleUrls: ['./projects-attachment.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsAttachmentComponent implements OnInit, AfterViewChecked {
  public title = '';
  public projectId;
  public attachments: any = [];
  public attachmentFile: UploadAttachments[];
  public clearField = false;
  public selectedTab = 0;
  constructor(public dialogRef: MatDialogRef<ProjectsAttachmentComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: IntAttachments,
    private workspace: NewWorkspaceService,
    public dialog: MatDialog,
  private cdRef: ChangeDetectorRef) {

  }
  ngOnInit() {
    this.title = this.dialogData['title'];
    this.projectId = this.dialogData['id'];
    if (this.dialogData['type'] !== 'view') {
      this.selectedTab = 1;
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  onClose() {
    this.dialogRef.close();
  }
  onUploadClose() {
    this.dialogRef.close();
  }
  onSubmitFile(file) {
    const uploadAttachment = [];
    file.filter((fileList, index) => {
      uploadAttachment.push(this.workspace.updateAttachment(fileList, this.dialogData['id'])
      );
    });
    zip(...uploadAttachment).subscribe(result => {
      if (result) {
        const message = 'Uploaded Successfully!';
        this.onOpenConfirmation(message);
      }
    },
    error => {
      const message = 'Something went wrong. Please try again.';
      this.onOpenConfirmation(message);
    });
  }

  onOpenConfirmation (msg) {
    const width = '586px';
    const data: ConfirmationDialog = {
      messageText: msg,
      notifyMessage: true
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(result => {
      if (result) {
          this.clearField = true;
      }
    });
  }
}
