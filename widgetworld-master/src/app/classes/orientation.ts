import {NumericRange} from '@interTypes/summary';
export class Orientation {
  private mapping = {
      'N': {
        min: 337.5,
        max: 22.5
      },
      'NE': {
        min: 22.5,
        max: 67.5
      },
      'E': {
        min: 67.5,
        max: 112.5
      },
      'SE': {
        min: 112.5,
        max: 157.5
      },
      'S': {
        min: 157.5,
        max: 202.5
      },
      'SW': {
        min: 202.5,
        max: 247.5
      },
      'W': {
        min: 247.5,
        max: 292.5
      },
      'NW': {
        min: 292.5,
        max: 337.5
      }
  };
  public directionToDegree(direction: string): NumericRange {
    return this.mapping[direction];
  }
  public degreeToDirection(degree: NumericRange): string {
    let direction: string = null;
    Object.entries(this.mapping).forEach(([key, value]) => {
      if (value['min'] === degree['min'] &&
        value['max'] === degree['max']) {
        direction = key;
      }
    });
    return direction;
  }
  getOrientation(degree: string | number): string {
    if (typeof degree !== 'number') {
      return degree || '';
    }
    let direction: string = null;
    Object.entries(this.mapping).forEach(([key, value]) => {
      if (value['min'] < degree && degree < value['max']) {
        direction = key;
      }
      if (degree === 0 || degree === 360) {
        direction = 'N';
      }
    });
    return direction;
  }
}
