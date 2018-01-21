import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PredictService {
    url = environment.apiUrl + '/predict';

  constructor(
      private http: HttpClient,
  ) { }

  addTemplate( template: any) {
    return this.http.post(this.url, {template: template});
  }
}
