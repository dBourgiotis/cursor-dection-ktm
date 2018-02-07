import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class CalculateResultsService {
    url = environment.apiUrl + '/calculate_results';

    constructor(
        private http: HttpClient,
    ) { }

    get( percent: any, experimentType: any) {
        let params = new HttpParams();
        params = params.set('percent', percent);
        params = params.set('experimentType', experimentType);
        return this.http.get(this.url, {params: params});
    }
}
