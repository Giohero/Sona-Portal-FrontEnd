import { Pipe, PipeTransform } from '@angular/core';
import { Value } from '../models/items';
import { BusinessPartner } from '../models/customer';

@Pipe({ name: 'appFilter' })
export class FilterPipe implements PipeTransform {
  /**
   * Pipe filters the list of elements based on the search text provided
   *
   * @param items list of elements to search in
   * @param searchText search string
   * @returns list of elements filtered by search text or []
   */
  transform(items: Value[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return [];
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter(it => {
      return it.ItemName.toLocaleLowerCase().includes(searchText);
    });
  }
}