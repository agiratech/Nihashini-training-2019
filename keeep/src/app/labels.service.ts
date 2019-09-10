import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LabelsService {

  constructor() { }

  labels=[]

  public createLabel(label :{name}){
    this.labels.push(label);
  }
  public getlabel():Array<{name}>{
    return this.labels;
  }
}
