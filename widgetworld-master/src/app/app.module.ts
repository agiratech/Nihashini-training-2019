import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRouting } from './app.routing';
import {DefaultComponent} from './layout/default.component';
import { UserModule } from './user/user.module';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ExploreWorkspaceSharedModule } from '@shared/explore-workspace-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppConfig } from './app-config.service';
import { FatalError } from 'tslint/lib/error';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { environment } from '../environments/environment';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { AppLoaderComponent } from './app-loader.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { LeftNavBarComponent } from './layout/app-layout/left-nav-bar/left-nav-bar.component';
import { LoaderHeaderInterceptor } from './interceptors/loader-header.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HomePopupComponent } from './home/home-popup/home-popup.component';
import { CustomPreloadingStrategy } from './custom-preload-strategy';
import { DelconComponent } from './shared/components/delcon/delcon.component';
import localeEl from '@angular/common/locales/el';
import localePy from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import localeEn from '@angular/common/locales/en';
import localeTa from '@angular/common/locales/ta';
import localeHi from '@angular/common/locales/hi';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEl, 'el');
registerLocaleData(localePy, 'es');
registerLocaleData(localePt, 'pt');
registerLocaleData(localeEn, 'en')
registerLocaleData(localeTa, 'ta');
registerLocaleData(localeHi, 'hi');

// import { PlacesFileuploadComponent } from './places-fileupload/places-fileupload.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HomeComponent,
    AppLoaderComponent,
    AppLayoutComponent,
    LeftNavBarComponent,
    HomePopupComponent,
    DefaultComponent,
    DelconComponent,
    // PlacesFileuploadComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRouting,
    UserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgHttpLoaderModule.forRoot(),
    SharedModule,
    ExploreWorkspaceSharedModule,
    FlexLayoutModule,
    
  ],
  exports: [SharedModule, ExploreWorkspaceSharedModule],
  providers: [
    AppConfig,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderHeaderInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
      deps: [AppConfig],
      multi: true
    },
    CustomPreloadingStrategy,
  ],
  entryComponents: [AppLoaderComponent, HomePopupComponent, DelconComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    if (this.isIE()) {
      throw new FatalError('IE is not supported, Please upgrade your browser');
    }
    if (environment.production) {
      this.versionCheck();
    }
  }

  private versionCheck() {
    const localVersion = localStorage.getItem('version');
    const codeVersion = environment.version;
    if (localVersion) {
      console.info('current version is ' + localVersion);
    }
    if (!localVersion || localVersion !== codeVersion) {
      localStorage.clear();
      localStorage.setItem('version', codeVersion);
      location.reload(true);
    }
  }

  isIE() {
    const ua = window.navigator.userAgent;
    // IE 10 or older
    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      return true;
    }
    // IE 11
    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
      return true;
    }
    // other browser
    return false;
  }
}
