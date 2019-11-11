import { Duration } from './../Interfaces/workspaceV2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ProjectsList,
  Project,
  DuplicateProjectReq,
  DeleteProject,
  CreateProjectReq,
  WorkflowLables,
  DuplicateScenarioReq
} from '@interTypes/workspaceV2';

import {CommonService, ThemeService} from '@shared/services';
import { Observable, of, empty } from 'rxjs';
import {catchError, publishReplay, refCount} from 'rxjs/operators';
import { AppConfig } from '../app-config.service';

@Injectable({
  providedIn: 'root'
})
export class NewWorkspaceService {
  private readonly reqHeaders: HttpHeaders;
  private duration$: Observable<any> = null;
  constructor(private http: HttpClient,
    private config: AppConfig,
    private theme: ThemeService,
    private commonService: CommonService) {
    /* to stop the loader from showing up, remove once global loading spinner is removed and component based spinner is started */
    this.reqHeaders = new HttpHeaders();
    // .set('hide-loader', 'hide-loader');
  }
  public getProjects(): Observable<ProjectsList> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/';
    return this.http.get<ProjectsList>(url, {
      headers: this.reqHeaders
    }).pipe(

      catchError(error => of({ projects: [] }))
    );
  }
  public getProject(projectId): Observable<Project> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + projectId;
    return this.http.get<Project>(url, {
      headers: this.reqHeaders
    });
  }

  public updateProject(projectId, project): Observable<Project> {
    if (!project.attachments || project.attachments.length < 1) {
      delete project.attachments;
    }
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + projectId;
    return this.http.patch<Project>(url, project, {
      headers: this.reqHeaders
    }).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }
  public updateScenario(editIds, scenario): Observable<any> {
    return this.http.patch(this.config.envSettings['API_ENDPOINT']
      + 'workflows/scenarios/' + editIds.scenarioId, scenario);
  }
  public createSubProject(project): Observable<Project> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/';
    return this.http.post<Project>(url, project, {
      headers: this.reqHeaders
    }).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }

  public returnNullIfEmpty(str) {
    const strVariable = this.formatCommandline(str);
    if (strVariable === '' || strVariable === 'us') {
      return null;
    }
    return str;
  }
  formatCommandline(c: string | string[]) {
    if (typeof c === 'string') {
      return c.trim();
    }
  }

  public duplicateProjects(Params: DuplicateProjectReq): Observable<any> {
    return this.http.post(
      this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + Params['_id'] + '/clone',
      Params,
      { headers: this.reqHeaders }
    ).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }
  public duplicateScenario(data: DuplicateScenarioReq, id: string): Observable<any> {
    return this.http.post(
      this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + id + '/clone',
      data,
      { headers: this.reqHeaders }
    );
  }
  /**
   * @param id: scenario_id
  */
  public exportCSV(id): Observable<any> {
    const httpOptions: any = {
      headers: new HttpHeaders({}),
      responseType: 'text/csv'
    };
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + id + '/marketPlans/export';
    return this.http.get(url, httpOptions);
    // .pipe(
    //   catchError(error => {
    //     return of(error);
    //   })
    // );
  }
  public createProject(projectData: CreateProjectReq): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/';
    return this.http.post(url, projectData).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }
  public deleteProjects(Params: DeleteProject): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + Params['_id'];
    return this.http.delete(url,
      { headers: this.reqHeaders }
    );
  }
  getLabels(): WorkflowLables {
    return this.commonService.getWorkFlowLabels();
  }
  setProjectParents(projects) {
    localStorage.setItem('projectParents', JSON.stringify(projects));
  }
  getProjectParents() {
    return JSON.parse(localStorage.getItem('projectParents'));
  }

  setSubprojectLevel(level) {
    localStorage.setItem('subprojectLevel', level);
  }
  getSubprojectLevel() {
    return localStorage.getItem('subprojectLevel');
  }
  public generatePlan(plan): Observable<any> {
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/plans',
      plan,
      { headers: this.reqHeaders }
    );
  }

  /**
   *
   * @param scenarioId scenario id
   * @param plan Market plan
   */
  public createScenarioPlan(scenarioId, plan): Observable<any> {
    return this.http.post(
      this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + scenarioId + '/marketPlan',
      plan,
      {headers: this.reqHeaders}
    );
  }
  public getDurations(): Observable<Duration> {
    if (!this.duration$) {
      const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/durations/';
      this.duration$ = this.http.get<Duration>(url, {
        headers: this.reqHeaders
      }).pipe(
        publishReplay(1),
        refCount(),
        catchError(error => empty())
      );
    }
    return this.duration$;
  }
    /**
   *
   * @param scenarioId reset plan scenario id
   */
  public resetScenarioPlan(scenarioId, plan): Observable<any> {
    return this.http.post(
      this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + scenarioId + '/marketPlan?reset=true', plan ,
       {headers: this.reqHeaders}
    );
  }
/**
 *
 * @param file attachment file
 * @param id project/scenario id
 * @param type which type to be upload
 * @param module In which module to be upload(project/scenario)
 */
  public updateAttachment(file, id, module= 'projects'): Observable<any> {
    let moduleParam = '';
    let typeParam = '';

    if (['image/png', 'image/jpeg', 'image/jpg' ].includes(file.fileType)) {
      moduleParam =  module + '/logos';
      typeParam = 'logo';
    } else {
      moduleParam =  module + '/docs';
      typeParam = 'document';
    }

    return this.http.patch(
      this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + id + '/upload?module=' + moduleParam + '&type=' + typeParam ,
      file.fileFormData, {headers: this.reqHeaders},
    ).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }

  public deleteAttachment(projectId, key): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + projectId + '/remove?key=' + key;
    return this.http.delete(url,
      { headers: this.reqHeaders }
    );
  }
  public setProjectsForScenario(projectId, level) {
    let parents = JSON.parse(localStorage.getItem('projectsForScenario'));
    if (level <= 0) {
      parents = {};
    }
    parents[level] = projectId;
    localStorage.setItem('projectsForScenario', JSON.stringify(parents));
  }
  public getProjectsForScenario() {
   return JSON.parse(localStorage.getItem('projectsForScenario'));
  }
  public clearProjectsForScenario() {
    localStorage.setItem('projectsForScenario', '{}');
    localStorage.setItem('popupScenarioName', '');
    localStorage.setItem('popupInventoryName', '');
  }
  public setPopupScenarioName(name) {
    localStorage.setItem('popupScenarioName', name);
  }
  public getPopupScenarioName() {
    return localStorage.getItem('popupScenarioName');
  }
  public setPopupInventoryName(name) {
    localStorage.setItem('popupInventoryName', name);
  }
  public getPopupInventoryName() {
    return localStorage.getItem('popupInventoryName');
  }
}
