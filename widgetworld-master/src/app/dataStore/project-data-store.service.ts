import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, concat, Observable, of} from 'rxjs';
import {empty} from 'rxjs/internal/Observer';
import {map, publishReplay, refCount, tap} from 'rxjs/operators';
import {AppConfig} from '../app-config.service';
import {Project, ProjectsList, Scenario, SubProject} from '@interTypes/workspaceV2';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataStoreService {
  private projectStore: BehaviorSubject<any> = new BehaviorSubject(null);
  private reqHeaders: HttpHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
  constructor(private http: HttpClient,
              private config: AppConfig) {
  }

  /**
   * Call this function to start calling the background data collection
   */
  public start(): void {
    if (this.projectStore.getValue()) {
      return;
    }
    const url = `${this.config.envSettings['API_ENDPOINT']}workflows/projects`;
    this.http.get(url, { headers: this.reqHeaders })
      .pipe(
        map((response: ProjectsList) => response['projects']),
        tap((response) => {
          if (response) {
            const subProjects = [];
            response
              .filter((project: Project) => project.subProjects.length > 0)
              .forEach((project: Project) => {
                const result = this.getSubProjectObservables(project);
                subProjects.push(...result);
              });
            this.getSubProjects(subProjects);
          }
        })
      )
      .subscribe(response => {
        this.projectStore.next(response);
      });
  }
  private getSubProjects(subProjects: Observable<any>[]) {
    concat(...subProjects)
      .subscribe(subProject => {
        this.assignSubProject(subProject);
      });
  }
  private assignSubProject(projectData: SubProject) {
    // Getting current store data
    const projects = this.projectStore.getValue();
    // Getting the parent project index in array
    const projectIndex = projects.findIndex((project: Project) => project.subProjects.includes(projectData._id));
    // Gettin the sub project index in the nested array;
    if (projects[projectIndex] && projects[projectIndex].subProjects) {
      const subProjectIndex = projects[projectIndex].subProjects.findIndex(value => {
        return value === projectData._id;
      });
      // replacing subProject data in place of its ID
      projects[projectIndex]['subProjects'][subProjectIndex] = projectData;
      // Setting updated data back to the store
      this.projectStore.next(projects);
    }
  }
  private getSubProjectObservables(project: Project | SubProject): Observable<any>[] {
    return project.subProjects.map((subProjectId: string) => {
      const detailUrl = `${this.config.envSettings['API_ENDPOINT']}workflows/projects/${subProjectId}`;
      return this.http.get(detailUrl, {headers: this.reqHeaders});
    });
  }

  /**
   *
   * @param projectId Id of any project / sub project that needs to be deleted
   *
   * This function will not delete any actual projects from the database, this
   * will only handle the data that is cached in local. Deleting projects actually
   * should be done before calling this function.
   */
  public deleteProject(projectId: string): void {
    const projectData = JSON.parse(JSON.stringify(this.projectStore.getValue()));
    if (!projectData) {
      return;
    }
    this.deleteProjectFromData(projectData, projectId);
    this.projectStore.next(projectData);
  }
  private deleteProjectFromData(projectData, projectId) {
    const projectIndex = projectData.findIndex(project => project._id === projectId);
    if (projectIndex >= 0) {
      projectData.splice(projectIndex, 1);
    } else {
      projectData
        .filter(project => project.subProjects && project.subProjects.length > 0)
        .map(project => {
        // recursion here instead of looping over the nested data
        this.deleteProjectFromData(project.subProjects, projectId);
      });
    }
  }
  public deleteScenario(scenarioId: string, projectId: string): void {
    const projectData = JSON.parse(JSON.stringify(this.projectStore.getValue()));
    if (!projectData) {
      return;
    }
    this.deleteScenarioById(projectData, projectId, scenarioId);
    this.projectStore.next(projectData);
  }
  private deleteScenarioById(projectData, projectId, scenarioId) {
    const projectIndex = projectData.findIndex(project => project._id === projectId);
    if (projectIndex >= 0 && projectData[projectIndex].scenarios) {
      const scenarioIndex = projectData[projectIndex].scenarios
        .findIndex(scenario => scenarioId === scenario._id);
      if (scenarioIndex >= 0) {
        projectData[projectIndex].scenarios.splice(scenarioIndex, 1);
      }
    }
    projectData.map((project: Project | SubProject) => {
      this.deleteScenarioById(project.subProjects, projectId, scenarioId);
    });
    return projectData;
  }

  /**
   * Function to be used to update the store if a new project is created or updated.
   * This will not do any database / API related alterations, only changes to the local cache
   *
   * @param project project that is created or updated
   * @param parentId parent of the created/updated project if updated project is a subproject
   *
   */
  // TODO : Need to call this on project Create
  public addOrUpdateProject(project, parentId = null) {
    const projects = this.projectStore.getValue();
    if (!projects) {
      return;
    }
    const projectData = JSON.parse(JSON.stringify(this.projectStore.getValue()));
    if (!projectData) {
      return;
    }
    const projectExists = projectData.findIndex(current => current._id === project._id);
    // if top level project and already exists
    if (!parentId && projectExists < 0) {
      projectData.push(project);
    // if new top level project
    } else if (projectExists >= 0) {
      projectData[projectExists] = project;
    } else {
      this.findProjectAndUpdate(project, parentId, projectData);
    }
    this.projectStore.next(projectData);
  }
  private findProjectAndUpdate(updatedProject, parentId, projectData) {
    const projectIndex = projectData.findIndex(project => project._id === parentId);
    // If Project found at the current level
    if (projectIndex >= 0) {
      const isExists = projectData[projectIndex].subProjects
        .findIndex(subProject => subProject._id === updatedProject._id);
      // If given project is an update
      if (isExists < 0) {
        projectData[projectIndex].subProjects.push(updatedProject);
        return true;
      } else {
        projectData[projectIndex].subProjects[isExists] = updatedProject;
        return true;
      }
    } else {
      // If project not found in current level, use recursion to search in sub Projects
      projectData
        .filter(project => project.subProjects && project.subProjects.length > 0)
        .some(project => {
          return this.findProjectAndUpdate(updatedProject, parentId, project.subProjects);
        });
      return false;
    }
  }
  public addOrUpdateScenrio(scenario, parentId) {
    const projectData = JSON.parse(JSON.stringify(this.projectStore.getValue()));
    if (!projectData) {
      return;
    }
    this.findAndUpdateScenario(projectData, scenario, parentId);
    this.projectStore.next(projectData);
  }

  private findAndUpdateScenario(projectData, scenario, parentId) {
    const projectIndex = projectData.findIndex(project => project._id === parentId);
    // top level scenario, just update it
    if (projectIndex >= 0) {
      const scenarioIndex = projectData[projectIndex].scenarios
        .findIndex(current => current._id === scenario._id);
      if (scenarioIndex >= 0) {
        projectData[projectIndex].scenarios[scenarioIndex] = scenario;
        return true;
      } else {
        projectData[projectIndex].scenarios.push(scenario);
        return true;
      }
    } else {
      return projectData
        .filter(project => project.subProjects && project.subProjects.length > 0)
        .some(project => {
          return this.findAndUpdateScenario(project.subProjects, scenario, parentId);
        });
    }
  }

  /** this will get scenario by ID from store, if its not available, it'll return a http observable
   * @param scenarioId String: the scenario id to be searched
   */
  public getScenarioById(scenarioId: string): Observable<any> {
    const projects = this.projectStore.getValue();
    let scenario;
    if (projects) {
      scenario = this.findScenario(projects, scenarioId);
    }
    if (scenario) {
      return of({scenario: scenario});
    } else {
      const url = `${this.config.envSettings['API_ENDPOINT']}workflows/scenarios/${scenarioId}`;
      return this.http.get(url)
        .pipe(
          publishReplay(1),
          refCount());
    }
  }

  /**
   * Find scenaro by ID from the store, return false if not found
   * @param scenarioId
   */
  private findScenario(projects, scenarioId: string): any {
    for (const project of projects) {
      if (!project.scenarios || project.scenarios.length <= 0) {
        continue;
      }
      const scenarioIndex = project.scenarios
        .findIndex(scenario => {
          return scenario === scenarioId || scenario._id === scenarioId;
        });
      if (scenarioIndex >= 0) {
        return project.scenarios[scenarioIndex];
      } else {
        // recursion used here because we can't assume the nesting level
        const result = this.findScenario(project.subProjects, scenarioId);
        if (result) {
          return result;
        }
      }
    }
    return false;
  }
  /**
   * Method to get the project store data from the local collected data,
   * Please be aware that this function returns an observable and will
   * emit multiple times, probably need to use an async pipe to handle this.
   */
  public getData(): Observable<any> {
    return this.projectStore.asObservable();
  }

  /**
   * Method to clear the cached data in the UI side if in case the user logs out
   * or data become obsolete.
   */
  clearData() {
    this.projectStore.next(null);
  }
}
