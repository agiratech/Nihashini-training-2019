import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchdata'
})
export class SearchdataPipe implements PipeTransform {

  transform(items: any[], searchText: string, status: string): any[] {
    if (!items) return [];
    searchText = searchText.toLowerCase();
      items = items.filter( it => {
        return it.account['name'].toLowerCase().includes(searchText);
      });
    if (status === 'all') {
      return items;
    }else {
      return items.filter( it => {
        return it.status.toLowerCase().includes(status);
      });
    }
   }
}

