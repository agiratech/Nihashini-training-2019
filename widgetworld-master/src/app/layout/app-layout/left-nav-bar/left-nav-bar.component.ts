import { Component, OnInit, ViewChild, Renderer2} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthenticationService, CommonService, ThemeService } from '@shared/services';

@Component({
  selector: 'app-left-nav-bar',
  templateUrl: './left-nav-bar.component.html',
  styleUrls: ['./left-nav-bar.component.less']
})
export class LeftNavBarComponent implements OnInit {
  showFiller = false;
  showMore = false;
  @ViewChild(MatMenuTrigger , {static: false}) trigger: MatMenuTrigger;
  homeUrl = 'v2/projects';
  public helpModule: any;
  userData: any;
  themeSettings: any;
  helpUrl = '';
  constructor(   private auth: AuthenticationService,
    private commonService: CommonService, private renderer: Renderer2, private themeService: ThemeService) { }

  ngOnInit() {
    this.helpModule = this.auth.getModuleAccess('help');
    this.userData = this.auth.getUserData();
    this.themeSettings = this.themeService.getThemeSettings();
    this.helpUrl = this.themeSettings && this.themeSettings['customize'] && this.themeSettings['customize']['supportUrl'] || 'https://support.geopath.io';
    this.commonService.getWorkSpaceState().subscribe(
    url => {
        if (url) {
          this.homeUrl = url;
        } else {
          this.homeUrl = '/v2/projects';
        }
    });
   const workspaceURL = this.commonService.getRedirectUrl();
   if (workspaceURL) {
    this.homeUrl = workspaceURL;
   }
  }
  onshowFiller() {
    this.showFiller = !this.showFiller;
    if (this.showFiller) {
      this.showMore = false;
      this.renderer.addClass(document.body, 'navCollapse');
    } else {
      this.renderer.removeClass(document.body, 'navCollapse');
    }
  }
  onOpenMore() {
    this.showMore = !this.showMore;
  }
  openFeedback() {
    const res = zdObject.open();
    if (!res) {
      // disabling error messaging...
      console.log(`blocked access by zdObject`);
    }
  }
}
