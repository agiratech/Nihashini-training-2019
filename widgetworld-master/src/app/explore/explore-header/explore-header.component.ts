import { Component, OnInit, OnDestroy } from '@angular/core';
import { FiltersService } from '../filters/filters.service';
import { CommonService, AuthenticationService } from '@shared/services';
import { takeWhile, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-explore-header',
  templateUrl: './explore-header.component.html',
  styleUrls: ['./explore-header.component.less']
})
export class ExploreHeaderComponent implements OnInit, OnDestroy {
  public currentTab = '';
  public mobileView: boolean;
  public mouseIsInsideFilter = false;
  private unSubscribe = true;
  public inventoryApplyCount = 0;
  private open = false;
  mod_permission: any;
  allowInventory: any = '';
  allowInventoryAudience: any = '';
  public audienceLicense = {};
  public marketLicense: any;
  constructor(
      private filtersService: FiltersService,
      private commonService: CommonService,
      private auth: AuthenticationService
    ) { }

  ngOnInit() {
    this.mobileView = this.commonService.isMobile();
    this.filtersService.getFilterSidenav().pipe(takeWhile(() => this.unSubscribe)).subscribe(tabState => {
      if (!tabState['open']) {
        this.currentTab = '';
      }
    });
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.allowInventoryAudience = this.audienceLicense['status'];
    this.marketLicense = this.auth.getModuleAccess('markets');
    this.filtersService.getFilters()
    .pipe(
      debounceTime(200),
      distinctUntilChanged())
    .subscribe(filters => {
      const data = filters.data;
      this.inventoryApplyCount = 0;
      if (data['mediaTypeList']) {
        this.inventoryApplyCount += 1;
      }
      if (data['operatorList']) {
        this.inventoryApplyCount += 1;
      }
      if (data['location']) {
        this.inventoryApplyCount += 1;
      }
      if (data['geoPanelId'] || data['plantUnitId']) {
        this.inventoryApplyCount += 1;
      }
      if (data['inventorySet']) {
        this.inventoryApplyCount += 1;
      }
      if (data['scenario']) {
        this.inventoryApplyCount += 1;
      }
      if (data['mediaAttributes'] && Object.keys(data['mediaAttributes']).length !== 0) {
        this.inventoryApplyCount += 1;
      }
      if (data['thresholds']) {
        this.inventoryApplyCount += 1;
      }
    });
    const sessionFilter = this.filtersService.getExploreSession();
    if (sessionFilter && sessionFilter['clickAudience'] && sessionFilter['clickAudience'] === true) {
      setTimeout(() => {
        const element: HTMLElement = document.querySelector('#define-target') as HTMLElement;
          if (element) {
            element.click();
            const audience: HTMLElement = document.querySelector('.select-audience-panel') as HTMLElement;
            if (audience) {
            audience.click();
            }
          }
        }, 500);
    }
  }
  ngOnDestroy() {
    this.unSubscribe = false;
    const sessionFilter = this.filtersService.getExploreSession();
    if (sessionFilter) {
      sessionFilter['clickAudience'] = false;
      this.filtersService.saveExploreSession(sessionFilter);
    }
  }
  openFilterSiderbar(tab) {
    if (this.open && this.currentTab === tab) {
      this.open = !this.open;
    } else {
      this.open = true;
    }
    const sidenav = {open: this.open, tab: tab};
    this.currentTab = tab;
    this.filtersService.setFilterSidenav(sidenav);
  }
  mouseHover(event) {
    this.filtersService.setFilterSidenavOut(true);
  }
  mouseLeave(event) {
    this.filtersService.setFilterSidenavOut(false);
  }
}
