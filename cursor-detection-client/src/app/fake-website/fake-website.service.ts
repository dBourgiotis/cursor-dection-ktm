import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FakeWebsiteService {

    url = 'https://newsapi.org/v2/top-headlines?' +
    'country=us&' +
    'apiKey=ee60f86b595e4c318f80ba4ea80c7b02';

    constructor(
        private http: HttpClient
    ) { }

    getNews() {
        return this.http.get(this.url);
    }

}
