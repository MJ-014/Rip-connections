import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConnectionItem } from './connectionItemInterface';

@Injectable({
  providedIn: 'root'
})
export class GetItemsService {

  constructor(private httpClient: HttpClient) { }

  GETItems() {
    let returnValue = {}
    this.httpClient.get('https://raw.githubusercontent.com/MJ-014/Rip-connections/main/docs/items.json', {responseType:'json'}).subscribe((res) => { returnValue = res; });
    return returnValue;
  }
}
