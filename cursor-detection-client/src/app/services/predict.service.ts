import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PredictService {
    url = environment.apiUrl + '/predict';

  constructor(
      private http: HttpClient,
  ) { }

  appendCandidate( template: any, windowHeight: any, windowWidth: any, collectionName: string) {
    return this.http.post(this.url,
      {template: template, windowHeight: windowHeight, windowWidth: windowWidth, collectionName: collectionName}
    );
  }
}
