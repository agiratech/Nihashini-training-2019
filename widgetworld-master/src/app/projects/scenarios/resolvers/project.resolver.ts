import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {WorkSpaceService} from '@shared/services/index';
import {EMPTY} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ProjectResolver implements Resolve<any> {
  constructor(private workSpaceService: WorkSpaceService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.workSpaceService.getProject(route.params.id)
      .pipe(catchError(() => {
        return EMPTY;
      }));
  }
}
