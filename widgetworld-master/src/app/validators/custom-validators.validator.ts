import {FormControl, FormGroup, ValidationErrors} from '@angular/forms';

export class CustomValidators {
  static vaildPassword(c: FormControl): ValidationErrors {
    const password = c.value;
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
    let isValid = true;
    const message = {
        'vaildPassword': {
            // tslint:disable-next-line:max-line-length
            'message': 'Passwords must be at lease 8 characters and contain at least one:capital letter,lower case letter,number, or symbol(-+_!@#$%^&*.,?).'
        }
    };
    if (reg.test(password)) {
        isValid = true;
    } else {
        isValid = false;
    }
    return isValid ? null : message;
  }
  static vaildEmail(c: FormControl): ValidationErrors {
    const email = c.value;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    let isValid = true;
    const message = {
        'vaildEmail': {
            'message': 'Should be valid email.'
        }
    };
    if (reg.test(email)) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid ? null : message;
  }
  static isCSV(c: FormControl): ValidationErrors {
    const fileName = c.value;
    const reg = /([a-zA-Z0-9\s_\\.\-\(\):])+(.csv)$/;
    let isValid = true;
    const message = {
        'inValidFile': {
            'message': 'Should be CSV file.'
        }
    };
    if (reg.test(fileName)) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid ? null : message;
  }
  static validUrl(c: FormControl): ValidationErrors {
    const url = c.value;
    const reg = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    let isValid = true;
    const message = {
        'validUrl': {
            'message': 'Should be valid Url.'
        }
    };
    if (reg.test(url)) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid ? null : message;
  }

  static validDateRange(startKey: string,
                        endKey: string): ValidationErrors {
    return (formGroup: FormGroup) => {
      const fromDate = formGroup.controls[startKey];
      const toDate = formGroup.controls[endKey];
      // if both dates are not present
      if (!fromDate.value && !toDate.value) {
        return null;
      }
      // if both dates are present
      if (fromDate.value && toDate.value) {
        const d_startDate = new Date(fromDate.value);
        const d_endDate = new Date(toDate.value);
        if (d_startDate >= d_endDate) {
          return {
            dates: 'Start Date should be less than End Date'
          };
        } else  {
          return {};
        }
      }
      // if either one date is present
      if (toDate.touched && toDate.value === 'null') {
        return {
          dates: 'Both start and end date must be entered or left blank'
        };
      }
    };
  }
  static validRange(min: string , max: string): ValidationErrors {
    return (formGroup: FormGroup) => {
      const min_value = Number(formGroup.controls[min].value);
      const max_value = Number(formGroup.controls[max].value);
      if ( (min_value > max_value) && max_value !== 0) {
          return {
            errors: 'Max value should be greater then min value.'
          };
      }
    };
  }
  static minmax(min: string , max: string): ValidationErrors {
    return (formGroup: FormGroup) => {
      const min_value = Number(formGroup.controls[min].value);
      const max_value = Number(formGroup.controls[max].value);
      if (min_value > 24 || min_value < 0)  {
        return {
          errors: 'Min value should be between 0 to 24'
        };
      }
      if (max_value > 24 || max_value < 0)  {
        return {
          errors: 'Max value should be between 0 to 24'
        };
      }
    };
  }
}
