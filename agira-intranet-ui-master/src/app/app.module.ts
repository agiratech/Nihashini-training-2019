import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { ChartsModule } from 'ng2-charts';
import { CommonModule,  DatePipe } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';


import { AppComponent } from './app.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';
import { AppRoutingModule } from './app.router';
import { AuthenticationService } from './authentication.service';
import { ClientService } from './services/client.service';
import { CategoryService } from './services/category.service';
import { ActivityService } from './services/activity.service';
import { TemplatesService } from './services/templates.service';
import { TemplatesMetricService } from './services/templates-metric.service';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './layouts/footer/footer.component';
import { ProjectListComponent } from './projects/list/project-list.component';
import { CreateClientComponent } from './clients/create/create-client.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './layouts/header/header.component';
import { SidenavComponent } from './layouts/sidenav/sidenav.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ClientListComponent } from './clients/list/client-list.component';
import { ProjectService } from './services/project.service';
import { AccountsService } from './services/accounts.service';
import { GoalService } from './services/goal.service';
import { DataService } from './services/data.service';
// import { EditProjectComponent } from './projects/edit/edit-project.component';
// import { ShowProjectComponent } from './projects/show/show-project.component';
import { CreateProjectComponent } from './projects/create/create-project.component';
import { EditClientComponent } from './clients/edit/edit-client.component';
// import { ShowErrorsComponent } from './show-errors/show-errors.component';
import { ShowErrorsModule } from './show-errors/show-errors.module';
import { CustomValidators } from './validators/custom-validators.validator';
import { CreateAccountComponent } from './accounts/create/create-account.component';
import { EditAccountComponent } from './accounts/edit/edit-account.component';
import { AccountListComponent } from './accounts/list/account-list.component';
import { GoalsListComponent } from './goals/list/goals-list.component';
// import { CreateGoalComponent } from './goals/create/create-goal.component';
// import { EditGoalComponent } from './goals/edit/edit-goal.component';
// import { ShowGoalComponent } from './goals/show/show-goal.component';
import { MetricService } from './services/metric.service';
import { FlashComponent } from './flash/flash.component';
import { FlashService } from './flash/flash.service';
import { AccountsMetricsComponent } from './accounts/metrics/accounts-metrics.component';
import { ShowComponent } from './accounts/show/show.component';
import { CreateTimesheetComponent } from './timesheets/create-timesheet/create-timesheet.component';
import { EditTimesheetComponent } from './timesheets/edit-timesheet/edit-timesheet.component';
import { ListTimesheetComponent } from './timesheets/list-timesheet/list-timesheet.component';
import { TimesheetService } from './services/timesheet.service';
// import { ListComponent } from './accountGoals/list/list.component';
// import { CreateComponent } from './accountGoals/create/create.component';
import { AccountGoalsService } from './services/account-goals.service';
import { AccountMetricsService } from './services/account-metrics.service';
// import { EditComponent } from './accountGoals/edit/edit.component';
import { CreateAccountMetricsComponent } from './accountMetrics/create-account-metrics/create-account-metrics.component';
import { ListAccountMetricsComponent } from './accountMetrics/list-account-metrics/list-account-metrics.component';
import { EditAccountMetricsComponent } from './accountMetrics/edit-account-metrics/edit-account-metrics.component';
import { TeamGoalsComponent } from './accountGoals/team-goals/team-goals.component';
// import { DuplicateComponent } from './accountGoals/duplicate/duplicate.component';
import { SettingsComponent } from './settings/settings.component';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import {TabModule} from 'angular-tabs-component';
import { SettingsService } from './services/settings.service';
import { ReportComponent } from './report/report.component';
import { StatusReportComponent } from './status-report/status-report.component';
import { ErrorService } from './services/error.service';
import { CalculatorComponent } from './calculator/calculator.component';
import { SearchdataPipe } from './pipes/searchdata.pipe';
import { DataTableModule } from 'angular2-datatable';
import { AccountsearchPipe } from './pipes/accountsearch.pipe';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { PieChartComponent } from './users/pie-chart/pie-chart.component';
import { UsersService } from './users/users.service';
import { DonutChartComponent } from './users/donut-chart/donut-chart.component';
import { StackedBarChartComponent } from './users/stacked-bar-chart/stacked-bar-chart.component';
import { BarComponent } from './users/bar/bar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChartsComponent } from './timesheets/charts/charts.component';
import { AdminChartsComponent } from './timesheets/admin-charts/admin-charts.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { CategoriesListComponent } from './categories/categories-list/categories-list.component';
import { ActivitiesListComponent } from './activities/activities-list/activities-list.component';
import { RouteReuseStrategy } from '@angular/router/';
import { TeamListComponent } from './team/team-list/team-list.component';
import { ProjectComponent } from './projects/project/project.component';
import { AssignProjectsComponent } from './projects/assign-projects/assign-projects.component';
import { ShowProjectComponent } from './projects/show/show-project.component';
import { DebounceDirective } from './directives/debounce.directive';
import { ListTemplatesComponent } from './templates/list-templates/list-templates.component';
import { CreateTemplatesComponent } from './templates/create-templates/create-templates.component';
import { EditTemplatesComponent } from './templates/edit-templates/edit-templates.component';
import { ShowTemplateComponent } from './templates/show-template/show-template.component';
import { ListTemplateMetricsComponent } from './template-metrics/list-template-metrics/list-template-metrics.component';
import { CreateTemplateMetricsComponent } from './template-metrics/create-template-metrics/create-template-metrics.component';
import { EditTemplateMetricsComponent } from './template-metrics/edit-template-metrics/edit-template-metrics.component';


// import { CustomReuseStrategy } from './CustomReuseStrategy ';
@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    FooterComponent,
    ProjectListComponent,
    CreateClientComponent,
    DashboardComponent,
    HeaderComponent,
    SidenavComponent,
    ClientListComponent,
    // EditProjectComponent,
    // ShowProjectComponent,
    CreateProjectComponent,
    EditClientComponent,
    // ShowErrorsComponent,
    CreateAccountComponent,
    EditAccountComponent,
    AccountListComponent,
    GoalsListComponent,
    // CreateGoalComponent,
    // EditGoalComponent,
    // ShowGoalComponent,
    FlashComponent,
    AccountsMetricsComponent,
    ShowComponent,
    CreateTimesheetComponent,
    EditTimesheetComponent,
    ListTimesheetComponent,
    // ListComponent,
    // CreateComponent,
    // EditComponent,
    CreateAccountMetricsComponent,
    ListAccountMetricsComponent,
    EditAccountMetricsComponent,
    TeamGoalsComponent,
    // DuplicateComponent,
    SettingsComponent,
    ReportComponent,
    StatusReportComponent,
    CalculatorComponent,
    SearchdataPipe,
    AccountsearchPipe,
    PieChartComponent,
    DonutChartComponent,
    StackedBarChartComponent,
    BarComponent,
    ChartsComponent,
    AdminChartsComponent,
    CategoriesListComponent,
    ActivitiesListComponent,
    TeamListComponent,
    ProjectComponent,
    AssignProjectsComponent,
    ShowProjectComponent,
    DebounceDirective,
    ListTemplatesComponent,
    CreateTemplatesComponent,
    EditTemplatesComponent,
    ShowTemplateComponent,
    ListTemplateMetricsComponent,
    CreateTemplateMetricsComponent,
    EditTemplateMetricsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    HighchartsChartModule,
    ChartsModule,
    TabModule,
    FlashMessagesModule.forRoot(),
    Ng4LoadingSpinnerModule.forRoot(),
    ShowErrorsModule,
    MultiselectDropdownModule,
    DataTableModule,
    NgxPaginationModule,
    NgxMyDatePickerModule.forRoot()
  ],
  schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    DebounceDirective
  ],
  providers: [
    AuthenticationService,
    ClientService,
    CategoryService,
    ActivityService,
    ProjectService,
    AccountsService,
    GoalService,
    AuthGuard,
    MetricService,
    RoleGuard,
    FlashService,
    TimesheetService,
    DatePipe,
    AccountGoalsService,
    AccountMetricsService,
    SettingsService,
    ErrorService,
    UsersService,
    DataService,
    TemplatesService,
    TemplatesMetricService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
