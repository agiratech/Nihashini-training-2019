import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateClientComponent } from './clients/create/create-client.component';
import { ClientListComponent } from './clients/list/client-list.component';
import { CategoriesListComponent } from './categories/categories-list/categories-list.component';
import { ActivitiesListComponent } from './activities/activities-list/activities-list.component';
import { ProjectListComponent } from './projects/list/project-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
// import { EditProjectComponent } from './projects/edit/edit-project.component';
// import { ShowProjectComponent } from './projects/show/show-project.component';
// import { CreateProjectComponent } from './projects/create/create-project.component';
import { EditClientComponent } from './clients/edit/edit-client.component';
import { AccountListComponent } from './accounts/list/account-list.component';
import { CreateAccountComponent } from './accounts/create/create-account.component';
import { EditAccountComponent } from './accounts/edit/edit-account.component';
import { ShowComponent } from './accounts/show/show.component';
import { GoalsListComponent } from './goals/list/goals-list.component';
import { EditGoalComponent } from './goals/edit/edit-goal.component';
import { CreateGoalComponent } from './goals/create/create-goal.component';
import { ShowGoalComponent } from './goals/show/show-goal.component';
import { AccountsMetricsComponent } from './accounts/metrics/accounts-metrics.component';
import { CreateTimesheetComponent } from './timesheets/create-timesheet/create-timesheet.component';
import { ListTimesheetComponent } from './timesheets/list-timesheet/list-timesheet.component';
import { EditTimesheetComponent } from './timesheets/edit-timesheet/edit-timesheet.component';
import { ChartsComponent } from './timesheets/charts/charts.component';
// import { ListComponent } from './accountGoals/list/list.component';
// import { CreateComponent } from './accountGoals/create/create.component';
// import { EditComponent } from './accountGoals/edit/edit.component';
import { ListAccountMetricsComponent } from './accountMetrics/list-account-metrics/list-account-metrics.component';
import { CreateAccountMetricsComponent } from './accountMetrics/create-account-metrics/create-account-metrics.component';
import { EditAccountMetricsComponent } from './accountMetrics/edit-account-metrics/edit-account-metrics.component';
import { TeamGoalsComponent } from './accountGoals/team-goals/team-goals.component';
// import { DuplicateComponent } from './accountGoals/duplicate/duplicate.component';
import { SettingsComponent } from './settings/settings.component';
import { ListTemplatesComponent } from './templates/list-templates/list-templates.component';
import { CreateTemplatesComponent } from './templates/create-templates/create-templates.component';
import { EditTemplatesComponent } from './templates/edit-templates/edit-templates.component';
import { ShowTemplateComponent } from './templates/show-template/show-template.component';
import { CreateTemplateMetricsComponent } from './template-metrics/create-template-metrics/create-template-metrics.component';
import { EditTemplateMetricsComponent } from './template-metrics/edit-template-metrics/edit-template-metrics.component';
import { ListTemplateMetricsComponent } from './template-metrics/list-template-metrics/list-template-metrics.component';
import { ReportComponent } from './report/report.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { AdminChartsComponent } from './timesheets/admin-charts/admin-charts.component';
import { TeamListComponent } from './team/team-list/team-list.component';
import { ProjectComponent } from './projects/project/project.component';
import { ShowProjectComponent } from './projects/show/show-project.component';
import { CreateProjectComponent } from './projects/create/create-project.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistrationComponent },
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '', canActivate: [AuthGuard], children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'timesheet/new', component: CreateTimesheetComponent},
    { path: 'timesheets', component: ListTimesheetComponent },
    { path: 'charts', component: ChartsComponent },
    { path: 'admin-reports', component: AdminChartsComponent },
    // { path: 'account/:id/accountGoals', component: ListComponent },
    {
      path: 'account/:id/accountGoals',
      loadChildren: 'app/accountGoals/account-goals.module#AccountGoalsModule'
    },
    { path: 'teamGoals', component: TeamGoalsComponent },
    { path: 'myTeams', component: TeamListComponent },
    { path: 'myProjects', component: ProjectComponent },
    { path: 'calculator', component: CalculatorComponent },
    { path: 'timesheet/:id/edit', component: EditTimesheetComponent },
    { path: 'account/:id/accountGoals/:accountGoal_id/metrics/new', component: CreateAccountMetricsComponent },
    { path: 'account/:id/accountGoals/:accountGoal_id/metrics/:accountMetric_id/edit', component: EditAccountMetricsComponent },
    { path: 'accountGoals/:accountGoal_id/metrics', component: ListAccountMetricsComponent },
    { path: '', canActivate: [RoleGuard], children: [
      { path: '', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent  },
      { path: 'templates', component: ListTemplatesComponent  },
      // { path: 'templates/:id/metrics', component: ShowTemplateComponent  },
      { path: 'templates/new', component: CreateTemplatesComponent  },
      { path: 'templates/:id/edit', component: EditTemplatesComponent  },
      { path: 'templates/:id/metrics/new', component: CreateTemplateMetricsComponent },
      { path: 'templates/:id/metrics', component: ListTemplateMetricsComponent },
      { path: 'templates/:id/metrics/:templateMetric_id/edit', component: EditTemplateMetricsComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'client/new', component: CreateClientComponent },
      { path: 'clients', component: ClientListComponent },
      { path: 'categories', component: CategoriesListComponent },
      { path: 'activities', component: ActivitiesListComponent },
      { path: 'client/:id', component: EditClientComponent },
      { path: 'client/:id', component: EditClientComponent },
      { path: 'project/new', component: CreateProjectComponent },
      { path: 'projects', component: ProjectListComponent},
      // { path: 'project/new', component: CreateProjectComponent },
      // { path: 'project/:id/edit', component: EditProjectComponent },
      { path: 'project/:id', component: ShowProjectComponent },
      { path: 'accounts', component: AccountListComponent },
      { path: 'account/new', component: CreateAccountComponent },
      { path: 'account/:id/edit', component: EditAccountComponent },
      { path: 'account/:id', component: ShowComponent },
      // { path: 'account/:id/accountGoals/new', component: CreateComponent },
      // { path: 'account/:id/accountGoals/:accountGoal_id/edit', component: EditComponent },
      // { path: 'account/:id/accountGoals/:accountGoal_id/duplicate', component: DuplicateComponent },
      // { path: 'account/:id/accountGoals/:accountGoal_id/delete', component: EditComponent },
      { path: 'accounts/:id/metrics', component: AccountsMetricsComponent},
      { path: 'goals', component: GoalsListComponent },
      {
        path: 'project',
        loadChildren: 'app/projects/projects.module#ProjectsModule'
      },
      {
        path: 'goal',
        loadChildren: 'app/goals/goals.module#GoalsModule'
      }
      // { path: 'goal/:id/edit', component: EditGoalComponent },
      // { path: 'goal/new', component: CreateGoalComponent },
      // { path: 'goal/:id', component: ShowGoalComponent }
    ]}
  ]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
