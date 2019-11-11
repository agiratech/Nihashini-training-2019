import { Injectable } from '@angular/core';
import { GradientColor } from '../../classes/gradient-color';

@Injectable()
export class D3Service {
    constructor() {}
    generateUID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
   * generate 5 colors using parent color
   * @param color primary or secondary color
   * @param count No of colors required
   */
  public colorGenerater(color: string, count: number) {
    const grad = new GradientColor();
    const colors = grad.generate(color, count);
    return colors;
  }
}
