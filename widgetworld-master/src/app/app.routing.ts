import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@shared/guards/auth.guard';
import { MobileViewGuard } from '@shared/guards/mobile-view-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AccessGuard } from '@shared/guards/access.guard';
import {DefaultComponent} from './layout/default.component';
import { CustomPreloadingStrategy } from './custom-preload-strategy';
import { DefaultPageComponent } from '@shared/components/default-page/default-page.component';

const appRoutes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DefaultComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
        data: { title: 'Home', module: 'home' },
        canActivate: [AuthGuard, AccessGuard]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', module: 'projects' },
        canActivate: [AuthGuard]
      },
      {
        path: 'explore',
        loadChildren: 'app/explore/explore.module#ExploreModule',
        // canLoad: [AuthGuard],
        // Set preload true if you want to preload load the modules
        data: { preload: true }
      },
      {
        path: 'reports',
        loadChildren: 'app/reports/reports.module#ReportsModule',
        // canLoad: [AuthGuard],
        canActivate: [AccessGuard],
        data: { module: 'reports' }
      },
      {
        path: 'settings',
        loadChildren: 'app/settings/settings.module#SettingsModule',
        // canLoad: [AuthGuard],
        canActivate: [AccessGuard],
        data: { module: 'settings' }
      },
      {
        path: 'places',
        loadChildren: 'app/places/places.module#PlacesModule',
        canActivate: [MobileViewGuard, AccessGuard],
        data: {
          title: 'Places',
          message: 'The Places experience is currently available only in the desktop version of our app.',
          module: 'places',
          preload: true
        },
        // canLoad: [AuthGuard]
      },
      {
        path: 'v2/projects',
        loadChildren: 'app/projects/projects-v2.module#ProjectsV2Module',
        canActivate: [AuthGuard, MobileViewGuard, AccessGuard],
        canActivateChild: [MobileViewGuard],
        data: {
          title: 'Workspace',
          message: 'The Workspace experience is currently available only in the desktop version of our app.',
          module: 'projects',
          preload: false
        }
      },
    ]
  },
  {
    path: 'user',
    loadChildren: 'app/user/user.module#UserModule'
  },
  {
    path: 'error',
    component: DefaultPageComponent,
    data: {title: 'Intermx'}
  },
  { path: '**', redirectTo: 'user/login' }
];

export const AppRouting = RouterModule.forRoot(appRoutes, {preloadingStrategy: CustomPreloadingStrategy});
