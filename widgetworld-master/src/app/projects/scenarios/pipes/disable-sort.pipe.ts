import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'disableSort'})
export class DisableSortPipe implements PipeTransform {

  transform(value: any) {
    const sortEnabledFor = ['totwi', 'tgtwi', 'cwi',
     'totinmi', 'totinmp', 'tgtinmi', 'tgtinmp', 'compinmi', 'compi', 'trp', 'reach', 'freq', 'fid', 'pid'];
    if (sortEnabledFor.includes(value)) {
      return false;
    }
    return true;
  }
}

