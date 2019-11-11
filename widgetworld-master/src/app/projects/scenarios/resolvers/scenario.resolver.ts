import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {WorkSpaceService} from '@shared/services/index';
import {EMPTY} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ScenarioResolver implements Resolve<any> {
  constructor(private workSpaceService: WorkSpaceService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.workSpaceService.getScenariobyId(route.params.scenarioId)
      .pipe(catchError(() => {
        return EMPTY;
      }));
  }
}
