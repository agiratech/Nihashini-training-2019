import {HttpClientTestingModule} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {AppConfig} from '../app-config.service';

import { ProjectDataStoreService } from './project-data-store.service';

describe('ProjectDataStoreService', () => {
  let appConfig;
  beforeEach(async () => {
    appConfig = jasmine.createSpyObj('AppConfigService', [
      'load',
      'API_ENDPOINT'
    ]);
  });
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      {provide: AppConfig, useValue: appConfig},
    ]
  }));

  it('should be created', () => {
    const service: ProjectDataStoreService = TestBed.get(ProjectDataStoreService);
    expect(service).toBeTruthy();
  });
  it('should return an observable on get', () => {
    const service: ProjectDataStoreService = TestBed.get(ProjectDataStoreService);
    service.getData().subscribe(res => {
      expect(res).toBeNull();
    });
  });
  it('should do nothing if invalid project id is deleted', () =>{
    const service: ProjectDataStoreService = TestBed.get(ProjectDataStoreService);
    const result = service.deleteProject('Vignesh');
    expect(result).toBeUndefined();
  });
});
