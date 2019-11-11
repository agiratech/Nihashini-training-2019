import {ChangeDetectorRef, Component, OnInit, AfterViewChecked, Renderer2} from '@angular/core';
import {
  AuthenticationService,
  TitleService,
  CommonService,
  ThemeService
} from '@shared/services';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {environment} from '../environments/environment';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BreakpointObserver} from '@angular/cdk/layout';
import {AppLoaderComponent} from './app-loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthenticationService, TitleService]
})
export class AppComponent implements OnInit, AfterViewChecked {
  public appLoaderComponent = AppLoaderComponent;
  title = 'app';
  sitename = environment.siteName;
  themeSettings = environment.themeSettings;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private _cService: CommonService,
    private cdRef: ChangeDetectorRef,
    private auth: AuthenticationService,
    private theme: ThemeService,
    private breakpointObserver: BreakpointObserver,
    private renderer: Renderer2
  ) {}
  ngOnInit() {
    const themeSettings = JSON.parse(localStorage.getItem('themeSettings'));
    if (themeSettings && themeSettings['siteName']) {
      this.sitename = themeSettings['siteName'];
    }
    if (localStorage.getItem('token')) {
      this.auth.validateToken().subscribe(success => {
        // do nothing if token is valid
      }, error => {
        this.auth.logout();
      });
    }
    this.breakpointObserver.observe('(max-width: 767px)').subscribe( result => {
      this._cService.setMobileBreakPoint(result['matches']);
      if (result['matches']) {
        this.renderer.addClass(document.body, 'isMobile');
      } else {
        this.renderer.removeClass(document.body, 'isMobile');
      }
     });
    const self = this;
    this.theme.generateColorTheme();
    this.auth.createIdentify();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationStart)) {
        return;
      }
      const url = evt.url;
      self._cService.updateCurrentUrl(url);

    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd)
      , map(() => this.activatedRoute)
      , map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      })
      , filter((route) => route.outlet === 'primary')
      , mergeMap((route) => route.data))
      .subscribe((event) => this.titleService.setTitle(event['title'] + ' :: ' + this.sitename));
  }
  ngAfterViewChecked() {
    const content_height = $('.content-wrapper').height();
    $('.main-sidebar').height(content_height + 'px');
    if ($(window).width() > 767) {
        $('#usermenu').removeClass('collapse');
    } else {
        $('#usermenu').addClass('collapse');
    }
    this.cdRef.detectChanges();
  }
}
