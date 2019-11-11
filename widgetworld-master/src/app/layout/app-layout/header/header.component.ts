import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { ThemeService, AuthenticationService } from '@shared/services';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { PublicSignInComponent } from '@shared/components/publicSite/sign-in-sign-up/sign-in-sign-up.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('headerLayout', { static: false }) headerLayoutHeight: ElementRef;
  themeSettings: any;
  userData: any;
  isViewProfile = false;
  public isPublicSite = false;
  constructor(
    private theme: ThemeService,
    private auth: AuthenticationService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit() {
    this.userData = this.auth.getUserData();
    this.themeSettings = this.theme.getThemeSettings();
    this.theme.themeSettings.subscribe(res => {
      this.themeSettings = this.theme.getThemeSettings();
    });
    if (this.themeSettings.publicSite) {
      this.isPublicSite = true;
    } else {
      this.isPublicSite = false;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getDimensions();
    }, 100);
  }

  private getDimensions() {

    const layoutChanges = this.breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]);
    layoutChanges.subscribe(result => {
      setTimeout(() => {
        this.theme.setDimensions({
          headerHeight: this.headerLayoutHeight.nativeElement.offsetHeight,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          orientation: result.breakpoints['(orientation: portrait)'] ? 'portrait' : 'landscape'
        });
      }, 2);
    });


  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getDimensions();
  }

  showProfile() {
    this.isViewProfile = !this.isViewProfile;
  }
  openSigninUp(type) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      title: 'Angular For Beginners'
    };
    const dialogRef = this.dialog.open(PublicSignInComponent, {
      width: '603px',
      data: type,
    });
  }

}
