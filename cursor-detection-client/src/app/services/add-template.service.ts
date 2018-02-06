import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AddTemplateService {
    url = environment.apiUrl + '/template';
    urlPrediction = environment.apiUrl + '/predictions';

  constructor(
      private http: HttpClient,
  ) { }

  addTemplate( template: any, collectionName: string) {
    return this.http.post(this.url, {template: template, collectionName: collectionName});
  }

  addPrediction( template: any, collectionName: string) {
    return this.http.post(this.urlPrediction, {template: template, collectionName: collectionName});
  }
}
