import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    menu = [
        { name: 'Create Template', link: '/', active: false },
        { name: 'Prediction', link: '/prediction', active: false },
        { name: 'Fake Website', link: '/fake-website', active: false },
        { name: 'Analysis', link: '/analysis', active: false },
    ];

    constructor (
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.toggleMenu(this.router.url);
    }

    toggleMenu(link: string) {
        for (const item of this.menu ) {
            item.active = item.link === link ? true : false;
        }
    }
}
