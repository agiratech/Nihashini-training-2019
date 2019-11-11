import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService, ThemeService } from '@shared/services';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-user-agreement-dialog',
  templateUrl: './user-agreement-dialog.component.html',
  styleUrls: ['./user-agreement-dialog.component.less']
})
export class UserAgreementDialogComponent implements OnInit {
  themeSettings: any = {};
  constructor(
    private theme: ThemeService,
    private _authService: AuthenticationService,
    private _router: Router,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserAgreementDialogComponent>
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.themeSettings = this.theme.getThemeSettings();
    this.themeSettings = this.theme.getThemeSettings();
    const userAgreementAgreed = localStorage.getItem('userAgreementAgreed');
  }

  toggleAgreement(val) {
    if (val === 'agreed') {
      this._authService.updateAgreeAccept().subscribe(
        data => {
          this.dialogRef.close();
          localStorage.setItem('userAgreementAgreed', val);
          this._router.navigate(['/explore']);
        },
        error => {
          swal('Oops! Something went wrong, please try again.', '', 'error');
          this._authService.logout();
        }
      );
    } else {
      this._authService.logout(true);
      window.location.href = this.themeSettings.homepage;
    }
  }
}
