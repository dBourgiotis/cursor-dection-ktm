import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class AnalysisResultsService {
    url = environment.apiUrl + '/analysis_results';

    constructor(
        private http: HttpClient,
    ) { }

    get( resultsCollectionName: string) {
        let params = new HttpParams();
        params = params.set('verifiedResultsCollectionName', resultsCollectionName);
        return this.http.get(this.url, {params: params});
    }

}
