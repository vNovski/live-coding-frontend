import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, field: string): any[] {
    if (!items) return [];

    if (!searchText) return items;

    // convert the searchText to lower case
    searchText = searchText.toLowerCase();

    // retrun the filtered array
    return items.filter(item => {
      if (item && item[field]) {
        return item[field].toLowerCase().includes(searchText);
      }
      return false;
    });
   }
}
