import {Pipe, PipeTransform} from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'convert'
})
export class ConvertPipe implements PipeTransform {

  transform(value: any, type: any = 'THOUSAND', decimal: number = 0): any {
    if (typeof value !== 'undefined') {
      if (type === 'THOUSAND') {
        if (!isNaN(value)) {
          value = Math.round(value);
          value = value.toString();
        }
        // return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const n = String(value),
          p = n.indexOf('.');
        return n.replace(
            /\d(?=(?:\d{3})+(?:\.|$))/g,
            (m, i) => p < 0 || i < p ? `${m},` : m
        );
      } else if (type === 'PERCENT') {
        return this.convertToPercentageFormat(value, decimal);
      } else if (type === 'ABBREVIATE') {
        let result;
        let number;
        number = numeral(value);
        result = number.format('0.[0]a');
        const chknumber = result.replace(/[^\d.-]/g, '');
        if ( chknumber > 10) {
          result = number.format('0a');
        }
        return result;
      } else if (type === 'DECIMAL') {
        let result;
        let number;
        number = numeral(value);
        if (decimal && decimal === 3) {
          result = number.format('0.00[0]');
        } else if (decimal && decimal === 1) {
          result = number.format('0.[0]');
        } else {
          result = number.format('0.[00]');
        }
        return result;
      }
    } else {
      return value;
    }
  }

  private convertToPercentageFormat(key, decimal = 0) {
    // const percent = ((key) * 100);
    let percent = 0;
    if (key > 0 && key <= 1) {
      percent = ((key) * 100);
    } else {
      percent = key;
    }
    if (decimal > 0) {
      return this.convertToDecimalFormat(percent, 1);
    } else {
      if (percent > 10) {
        return Math.ceil(percent);
      } else if (percent < 10 && percent > 1) {
        return this.convertToDecimalFormat(percent, 1);
      } else {
        return this.convertToDecimalFormat(percent, 2);
      }
    }
  }
  private convertToDecimalFormat(val, p = 2) {
    const num = val;
    return num.toFixed(p);
  }
  private abbreviateNumber(number, decPlaces) {
    if (number < 1000) {
      return Math.ceil(number);
    }
    decPlaces = Math.pow(10, decPlaces);
    const abbrev = ['k', 'm', 'b', 't'];
    for (let i = abbrev.length - 1; i >= 0; i--) {
      const size = Math.pow(10, (i + 1) * 3);
      if (size <= number) {
        number = Math.round(number * decPlaces / size) / decPlaces;
        if ((number === 1000) && (i < abbrev.length - 1)) {
          number = 1;
          i++;
        }
        number += abbrev[i];
        break;
      }
    }
    return number;
  }
}
