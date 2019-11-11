import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {TargetAudienceService} from '@shared/services';
import {EMPTY} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DefaultAudienceResolver implements Resolve<any> {
  constructor(private rargetAudienceService: TargetAudienceService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.rargetAudienceService.getDefaultAudience()
      .pipe(catchError(() => {
        return EMPTY;
      }));
  }
}
