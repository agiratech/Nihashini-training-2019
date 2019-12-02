import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, CommonService } from '@shared/services';
import { FiltersService } from '../explore/filters/filters.service';
import { DelconComponent } from '../shared/components/delcon/delcon.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  public themeSettings: any;
  public isAudienceDisplay = false;
  public isWorkspaceDisplay = false;
  public isExploreDisplay = false;
  public isPlacesDisplay = false;
  public isReportsDisplay = false;
  public homeUrl = '/v2/projects';
  public message = false;

  public moduleDetails = [
    {
      name: 'Spotlight',
      description: 'The latest product news and updates from Geopath',
      isAudienceDisplay: true,
      moduleName: 'audiences',
      icon: ''
    },
    {
      name: 'Workspace',
      description: 'Packages, campaigns, and audience insights organized in one intuitive & interactive workplace.',
      isWorkspaceDisplay: false,
      moduleName: 'workspace',
      icon: 'apps'
    },
    {
      name: 'Explore',
      description: 'More than half a million Geopath-rated inventory on a map and at your fingertips.',
      isExploreDisplay: false,
      moduleName: 'explore',
      icon: 'explore'
    },
    {
      name: 'Places',
      description: 'Bring points of interest and geographies together in a way that fits your needs.',
      isPlacesDisplay: false,
      moduleName: 'places',
      icon: 'place'
    },
    {
      name: 'Reports',
      description: '<span class="boldText">Coming Soon</span>: Big data doesn’t have to equal big mess. Intuitive report widgets bring valuable insights to the surface.',
      isReportsDisplay: false,
      moduleName: 'reports',
      icon: 'assessment'
    }
  ];
  constructor(
    private router: Router,
    private theme: ThemeService,
    private filterService: FiltersService,
    private commonService: CommonService,
    public dialog : MatDialog
  ) {}

  ngOnInit() {
    this.themeSettings = this.theme.getThemeSettings();
    this.theme.themeSettings.subscribe(res => {
      this.themeSettings = this.theme.getThemeSettings();
    });
    this.selectPanel('audiences');
  }
  openDialog(){
    const dialogRef = this.dialog.open(DelconComponent,{
      width: '500px',
      data: {
        realTitle : 'Confirmation',
        realMessage : 'Are you sure you want to delete?',
        truebuttonText : 'ok',
        falsebuttonText : 'cancel'
      }
      });
    
      // dialogRef.componentInstance.dialogTitle = "Confirmation";
      // dialogRef.componentInstance.confirmMessage = "Are you sure you want to delete?" ;
      // dialogRef.componentInstance.confirmButtonText = "ok";
      // dialogRef.componentInstance.cancelButtonText= "cancel";
    
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
            });

  }
 
  selectPanel(module) {
    this.isAudienceDisplay = false;
    this.isWorkspaceDisplay = false;
    this.isExploreDisplay = false;
    this.isPlacesDisplay = false;
    this.isReportsDisplay = false;
    this.moduleDetails[0].isAudienceDisplay = false;
    this.moduleDetails[1].isWorkspaceDisplay = false;
    this.moduleDetails[2].isExploreDisplay = false;
    this.moduleDetails[3].isPlacesDisplay = false;
    this.moduleDetails[4].isReportsDisplay = false;
    switch (module) {
      case 'audiences':
        this.moduleDetails[0].isAudienceDisplay = true;
        this.isAudienceDisplay = true;
        break;
      case 'workspace':
        this.moduleDetails[1].isWorkspaceDisplay = true;
        this.isWorkspaceDisplay = true;
        break;
      case 'explore':
        this.moduleDetails[2].isExploreDisplay = true;
        this.isExploreDisplay = true;
        break;
      case 'places':
        this.moduleDetails[3].isPlacesDisplay = true;
        this.isPlacesDisplay = true;
        break;
      case 'reports':
        this.moduleDetails[4].isReportsDisplay = true;
        this.isReportsDisplay = true;
        break;
      default:
        this.isAudienceDisplay = true;
    }
  }
  redirectModule(module) {
    switch (module) {
      case 'audiences':
        const sessionFilter = this.filterService.getExploreSession();
        if (sessionFilter) {
          sessionFilter['clickAudience'] = true;
          this.filterService.saveExploreSession(sessionFilter);
        } else {
          this.filterService.saveExploreSession({'clickAudience': true});
          localStorage.setItem('clickAudience', 'true');
        }
        this.router.navigate(['/explore']);
        break;
      case 'workspace':
        this.commonService.getWorkSpaceState().subscribe(url => {
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
        this.router.navigate([this.homeUrl]);
        break;
      case 'explore':
        this.router.navigate(['/explore']);
        break;
      case 'places':
        this.router.navigate(['/places']);
        break;
      case 'reports':
        this.router.navigate(['/reports']);
        break;
      default:
        sessionFilter['clickAudience'] = true;
        this.filterService.saveExploreSession(sessionFilter);
        this.router.navigate(['/explore']);
    }
  }
}
