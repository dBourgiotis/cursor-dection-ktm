import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class VerifyResultsService {
    url = environment.apiUrl + '/html_verification';

  constructor(
      private http: HttpClient,
  ) { }

  get( resultsCollectionName: string) {
      let params = new HttpParams();
      params = params.set('resultsCollectionName', resultsCollectionName);
    return this.http.get(this.url, {params: params});
  }
}
