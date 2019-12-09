import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { AccountsService } from '../../services/accounts.service';
import { environment } from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  constructor(
    private router: Router,
    private authenticationservice: AuthenticationService,
    private accountsService: AccountsService,
    private errorService: ErrorService

  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin') /*|| this.currentUser['roles'].includes('manager') */) {
      this.authenticationservice.changeAdmin(false);
    } else {
      this.authenticationservice.changeAdmin(true);
    }
   }

  currentUser;
  is_Admin: boolean;
  account_id;
  account_name;
  profile_pic;
  is_manager;
  is_timesheet_manager: boolean;

  ngOnInit() {
    this.accountsService.profile_pic.subscribe(
      data => {
        this.profile_pic = data;
      }, error => {
        this.errorService.errorHandling(error);
      }
    );

    this.account_id = JSON.parse(localStorage.getItem('currentUser')).id;
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        let user = data.body['result'];
        if (user.is_timesheet_manager == true) {
          this.is_timesheet_manager = true;
        }else {
          this.is_timesheet_manager = false;
        }
        this.account_name = user.name;
      }, error => {
        this.errorService.errorHandling(error);
      }
    );
    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('manager')) {
      this.is_manager = true;
    } else {
      this.is_manager = false;
    }

  }

}
