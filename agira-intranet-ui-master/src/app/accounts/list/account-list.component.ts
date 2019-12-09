import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../services/accounts.service';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';




@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {

  accounts;
  response: any = {};
  color = false;
  noData = false;
  model: any = {};
  account: any = {};
  searchText = '';
  currentPageNo = 1;
  constructor(
    private accountservice: AccountsService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.spinnerService.show();
    /* Getting All the accounts */
    this.getAccounts();
  }

  getAccounts(pgNo?) {
    if (pgNo != null) {
      this.currentPageNo = pgNo;
    }
    this.accountservice.getAccounts(this.currentPageNo, this.searchText).subscribe(
      data => {
        this.spinnerService.hide();
        this.response = data.body['result'];
        this.accounts = data.body['result'].accounts;
        if (this.accounts.length === 0) {
          this.noData = true;
        }else {
          this.noData = false;
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }
  /* Delete the Account*/
  delete(id) {
    this.spinnerService.show();
    this.accountservice.deleteAccount(id).subscribe(
      data => {
        if (data.body['success'] === true) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getAccounts();
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Updating the Account */
  active(account) {
    this.spinnerService.show();
    this.account.id = account.id;
    this.account.role_ids = account.role_ids;
    this.account.is_active = true;
    this.model.account = this.account;
    this.spinnerService.show();
    this.accountservice.updateAccount(this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getAccounts();
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  check() {
    this.color = !this.color;
  }

}
