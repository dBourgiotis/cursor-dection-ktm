import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AddTemplateService {
    url = environment.apiUrl + '/template';

  constructor(
      private http: HttpClient,
  ) { }

  addTemplate( template: any) {
    return this.http.post(this.url, {template: template});
  }
}
