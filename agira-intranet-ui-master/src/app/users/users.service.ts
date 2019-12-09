import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class UsersService {

  constructor() { }
  public timeSheets: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public dates = new BehaviorSubject<any>([])

  changeTimeSheets(value: any) {
    this.timeSheets.next(value);
  }

  changeDates(value:any){
    this.dates.next(value)
  }
  // getTimeSheets(){
  //   return this.timeSheets;
  // }

}
