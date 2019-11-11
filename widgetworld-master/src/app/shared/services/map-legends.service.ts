import { Injectable } from '@angular/core';
import { KeyLegend } from '@interTypes/keyLegend';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapLegendsService {
  public keyLegends: BehaviorSubject<Partial<KeyLegend[]>> = new BehaviorSubject<Partial<KeyLegend[]>>([]);
  constructor() { }
  /**
   * pushKeyLegends This method using to push the key legends from other components.
   * @param legend It will contain the data of legend need to push. Must be in KeyLegend format
   */
  public pushKeyLegends(legend: KeyLegend[], key: string ) {
    const keys = this.keyLegends.getValue();
    keys[key] = legend;
    this.keyLegends.next(keys);
  }
  public clearKeyLegend(keys: any ) {
    const keyLegends = this.keyLegends.getValue();
    keys.forEach(key => {
      delete keyLegends[key];
    });
    this.keyLegends.next(keyLegends);
  }
  public keyLegendsSubscriber(): Observable<any> {
    return this.keyLegends.asObservable();
  }
}
