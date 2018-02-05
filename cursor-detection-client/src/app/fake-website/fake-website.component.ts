import { Component, HostListener, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FakeWebsiteService } from './fake-website.service';
import { PredictService } from '../services/predict.service';
import { AddTemplateService } from '../services/add-template.service';

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
    timeout: any;
    selected2: any;
    selected1: any;

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
        private predictService: PredictService,
        private addTemplateService: AddTemplateService,
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

        // Check if cursor has stop
        if (this.timeout !== undefined) {
            window.clearTimeout(this.timeout);
        }
        this.timeout = window.setTimeout(() => {
            this.coordinatesWithTime = [];
            console.log('stopped');
        }, 1000);

        this.coordinatesWithTime.push({ x: x, y: y, t: t});
    }

    @HostListener('click') onClick() {
        this.templateAddition.emit(this.coordinatesWithTime);
        this.addTemplate(this.coordinatesWithTime);
        // this.predictTemplate(this.coordinatesWithTime);
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

    addTemplate(event: any) {
        if (event.length) {
            this.addTemplateService.addTemplate(event, 'finalTemplates')
            .subscribe(
              data => {
                  console.log(data);
              },
              err => console.log(err)
            );
        }
    }

    predictTemplate(event: any) {
        if (event.length) {
            if (this.selected1) { this.selected1.className = ''; }
            if (this.selected2) { this.selected2.className = ''; }
            this.predictService.appendCandidate(event, window.innerHeight, window.innerWidth, 'finalTemplates')
                .subscribe(
                    data => {
                        const prediction1 = data['predicted_simple_distance'];
                        this.selected1 = document.elementFromPoint(prediction1[0], window.innerHeight - prediction1[1]);
                        this.selected1.classList.add('predicted_simple_distance');
                        const prediction2 = data['predicted_distance_from_velocity'];
                        this.selected2 = document.elementFromPoint(prediction2[0], window.innerHeight - prediction2[1]);
                        this.selected2.classList.add('predicted_distance_from_velocity');
                  },
                  err => console.log(err)
                );
        }
    }
}
