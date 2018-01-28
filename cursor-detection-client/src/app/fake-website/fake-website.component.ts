import { Component, HostListener, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FakeWebsiteService } from './fake-website.service';

declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-fake-website',
    templateUrl: 'fake-website.component.html',
    styleUrls: ['fake-website.component.css'],
    providers: [FakeWebsiteService]
})
export class FakeWebsiteComponent implements OnInit {
    sections = [
        {name: 'Top Stories', icon: 'chrome_reader_mode'},
        {name: 'World', icon: 'language'},
        {name: 'U.S', icon: 'assistant_photo'},
        {name: 'Business', icon: 'domain'},
        {name: 'Technology', icon: 'developer_board'},
        {name: 'Entertaiment', icon: 'local_movies'},
        {name: 'Sports', icon: 'directions_bike'},
        {name: 'Science', icon: 'school'},
        {name: 'Health', icon: 'fitness_center'},
    ];

    chips = [
        'Kabul',
        'Afghanistan',
        'Taliban',
        'Donald Trump',
        'Alexei Navalny',
        'Ingvar Kamprad',
        'Joe Kennedy III',
        'Russia',
        'IKEA',
        'Democratic Party'
    ];

    articles: any = [];

    coordinatesWithTime = [];
    @Output() templateAddition: EventEmitter<any> = new EventEmitter();

    constructor (
        private service: FakeWebsiteService,
    ) {}

    ngOnInit() {
        this.getNews();
    }

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        // reverse the (0,0) point
        const x = event.clientX;
        const y = window.innerHeight - event.clientY;
        const t = moment().valueOf();
        const lastItem = this.coordinatesWithTime.length > 1 ? this.coordinatesWithTime.length - 1 : null;
        // if ( lastItem && this.coordinatesWithTime[lastItem]['x'] === x && this.coordinatesWithTime[lastItem]['y'] === y ) {
        //     console.log(x, y, this.coordinatesWithTime[lastItem]);
        //     this.onClick();
        // }
        // const t = moment().format();
        this.coordinatesWithTime.push({ x: x, y: y, t: t});
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
        this.coordinatesWithTime = [];
    }

    @HostListener('click') onClick() {
        this.templateAddition.emit(this.coordinatesWithTime);
        this.coordinatesWithTime = [];
    }

    getNews() {
        this.service.getNews().subscribe(
            data => {
                this.articles = data['articles'];
            },
            err => {

            }
        );
    }
}
