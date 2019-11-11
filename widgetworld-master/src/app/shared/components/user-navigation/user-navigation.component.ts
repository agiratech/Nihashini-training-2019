import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ThemeService} from '@shared/services';
import {ProjectDataStoreService} from '../../../dataStore/project-data-store.service';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import { FiltersService } from '../../../explore/filters/filters.service';

@Component({
  selector: 'user-navigation',
  templateUrl: './user-navigation.component.html',
  styleUrls: ['./user-navigation.component.less']
})
export class UserNavigationComponent implements OnInit, AfterViewInit {
public audienceLicense = {};
public isGpLoginRequired: boolean;
  themeSettings: any;
  constructor(private auth: AuthenticationService,
              public router: Router,
              private filtersService: FiltersService,
              private projectStore: ProjectDataStoreService,
              private themeService: ThemeService) {
    this.themeSettings = themeService.getThemeSettings();
    this.isGpLoginRequired = this.themeSettings.gpLogin;
  }
  userData: any;
  mod_permission: any;
  allowInventory = '';
  allowInventoryAudience = '';
  ngOnInit() {
    this.userData = this.auth.getUserData();
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.allowInventoryAudience = this.audienceLicense['status'];
    this.auth.userDataUpdate.subscribe(res => {
      this.userData = this.auth.getUserData();
    });
}

  ngAfterViewInit() {
    // closing user navigation sub menu when we clicked on outside of seetings icon if it is open
    $(document).click(function(event) {
      const clickover = $(event.target);
      const opened = $('#usermenu').hasClass('in');
      if (opened === true && !clickover.hasClass('settings')) {
        $('.mobile-menu-item.settings').click();
      }

      setTimeout(function() {
        const openedSettingsMenu = $('#usermenu').hasClass('in');
        const openedFiltersMenu = $('#mobile-filter-menu').hasClass('in');

       if (openedSettingsMenu === true && !$('.mobile-menu-item.settings').hasClass('active')) {
         $('.mobile-menu-item.settings').addClass('active');
       }
       if (!openedSettingsMenu && $('.mobile-menu-item.settings').hasClass('active')) {
         $('.mobile-menu-item.settings').removeClass('active');
       }

       if (openedFiltersMenu === true && !$('.mobile-menu-item.filters').hasClass('active')) {
         $('.mobile-menu-item.filters').addClass('active');
       }
       if (!openedFiltersMenu && $('.mobile-menu-item.filters').hasClass('active')) {
         $('.mobile-menu-item.filters').removeClass('active');
       }
      }, 500);
    });
  }

  onLogout() {
    this.projectStore.clearData();
    this.auth.logout();
  }
  openFilterSiderbar() {
    const sidenav = {open: true, tab: 'target'};
    this.filtersService.setFilterSidenav(sidenav);
  }
}
