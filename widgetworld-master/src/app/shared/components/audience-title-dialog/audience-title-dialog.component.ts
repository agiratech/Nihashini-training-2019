import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-audience-title-dialog',
  templateUrl: './audience-title-dialog.component.html',
  styleUrls: ['./audience-title-dialog.component.less']
})
export class AudienceTitleDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AudienceTitleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
