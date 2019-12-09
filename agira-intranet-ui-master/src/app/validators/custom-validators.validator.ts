import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';

export class CustomValidators {
    static vaildEmail(c: FormControl): ValidationErrors {
        const email = c.value;
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
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
    static validUrl(c: FormControl): ValidationErrors {
        const url = c.value;
        let reg = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
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
}
