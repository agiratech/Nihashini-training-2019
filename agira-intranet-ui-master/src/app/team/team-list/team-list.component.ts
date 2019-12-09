import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../services/accounts.service';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  accounts;
  color = false;
  currentUser: any = {};
  noData = false;
  constructor(
    private accountservice: AccountsService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.spinnerService.show();
    /* Getting All the accounts */
    this.accountservice.getEmployees(this.currentUser.id).subscribe(
      data => {
        this.spinnerService.hide();
        this.accounts = data.body['result'];
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


  check() {
    this.color = !this.color;
  }

}
