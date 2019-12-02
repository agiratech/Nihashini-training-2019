import { Component,Inject, OnInit,ChangeDetectionStrategy} from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {DialogConfirm} from '@interTypes/workspaceV2';

@Component({
  selector: 'app-delcon',
  templateUrl: './delcon.component.html',
  styleUrls: ['./delcon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DelconComponent implements OnInit {

  todo=[];
  deletedata:any;
  public dialogTitle: string;
  public confirmMessage:string;
  public confirmButtonText:string;  
  public cancelButtonText:string;
  public message: boolean = false;

  constructor(public dialog: MatDialog ,
    public dialogRef: MatDialogRef<DelconComponent>,
    @Inject(MAT_DIALOG_DATA) public data:DialogConfirm ) { }
    

  ngOnInit() {
    console.log(this.data,'data')
    if (this.data){
      this.dialogTitle = this.data.realTitle;
      this.confirmMessage = this.data.realMessage;
      this.confirmButtonText = this.data.truebuttonText;
      this.cancelButtonText = this.data.falsebuttonText;
      // console.log(event,'event');

        }
  }

  delete(data: any) {
          this.dialogRef.close({event:'save'}); 
}
  onClose(): void {
    this.dialogRef.close({event:'Cancel'}); 
   
    }
}

// const dialogData: ConfirmationDialog = {
//   notifyMessage: true,
//   confirmTitle: 'Success',
//   messageText: 'Thank you! We have sent a verification code to your email. If you do not receive it, please email <a href="mailto:geekout@geopath.org" class="button-primary-link">geekOUT@geopath.org</a>',
// };
// this.dialog.open(ConfirmationDialogComponent, {
//   data: dialogData,
//   panelClass: 'public-signin-dialog'
// });
