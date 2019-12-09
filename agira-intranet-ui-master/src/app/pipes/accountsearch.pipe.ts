import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountsearch'
})
export class AccountsearchPipe implements PipeTransform {

  transform(items: any[], searchName: string, searchEmail: string): any[] {
    if(!items) return [];
      return items = items.filter( it => {
        return it.name.toLowerCase().includes(searchName) || it.email.toLowerCase().includes(searchName);
      });
   }

}
