import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tablecolor'
})

export class TablecolorPipe implements PipeTransform {

  color = false;
  transform(value: any, args?: any): any {
    if (value == undefined) {
      return this.color;
    }else {
      this.color = !this.color;
      return this.color;
    }
  }

}
