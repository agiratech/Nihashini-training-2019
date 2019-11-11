import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '@shared/services';
import { MatDialog } from '@angular/material/dialog';
import { UserAgreementDialogComponent } from '../user-agreement-dialog/user-agreement-dialog.component';

@Component({
  selector: 'user-login-agreement',
  templateUrl: './user-login-agreement.component.html',
  styleUrls: ['./user-login-agreement.component.less']
})
export class UserLoginAgreementComponent implements OnInit {
  themeSettings: any = {};
  dontShowAgreement;
  userAgreementCheck;
  constructor(
    private theme: ThemeService,
    private _router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.themeSettings = this.theme.getThemeSettings();
    this.dontShowAgreement = localStorage.getItem('dontShowAgreement');
    const userAgreementAgreed = localStorage.getItem('userAgreementAgreed');
    if (this.themeSettings['legal'] !== 'hidden') {
      if (this.dontShowAgreement !== 'true') {
        if (userAgreementAgreed === 'agreed') {
          this._router.navigate(['/explore']);
        } else {
          setTimeout(() => {
            this.openAgreementDialog();
          }, 100);
          this.userAgreementCheck = false;
        }
      } else {
        this.userAgreementCheck = true;
      }
    } else {
      this.userAgreementCheck = false;
      this._router.navigate(['/explore']);
    }
  }

  openAgreementDialog() {
    this.dialog.open(UserAgreementDialogComponent, {
      panelClass: 'userAgrement-dialog'
    });
  }
}
