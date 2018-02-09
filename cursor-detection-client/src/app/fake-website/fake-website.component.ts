import { Component, HostListener, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FakeWebsiteService } from './fake-website.service';
import { PredictService } from '../services/predict.service';
import { AddTemplateService } from '../services/add-template.service';
import { VerifyResultsService } from '../services/verify-results.service';

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
    aim = 'template';
    results: any;


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
        private verifyResultsService: VerifyResultsService,
    ) {}

    ngOnInit() {
        this.getNews();
    }

    verifyResults() {
        this.verifyResultsService.get('finalResults').subscribe(
          data => {
              this.results = data;
              const verifiedResults = this.verifyInHtml();
              this.postVerifiedResults(verifiedResults);
              console.log(verifiedResults);
          },
          err => console.log(err)
        );
      }
  
      postVerifiedResults(verifiedResults) {
        this.verifyResultsService.post('verifiedFinalResults', verifiedResults).subscribe(
          data => {
              console.log(data);
          },
          err => console.log(err)
        );
      }
  
      verifyInHtml() {
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        for (const item of this.results) {
          const originalElement = document.elementFromPoint(item['original']['x'], window.innerHeight - item['original']['y']);
  
          const predictedSimpleDistanceElement = document.elementFromPoint(item['predicted_simple_distance'][0],
          window.innerHeight - item['predicted_simple_distance'][1]);
  
          const predictedDistanceFromVelocityElement = document.elementFromPoint(item['predicted_distance_from_velocity'][0],
          window.innerHeight - item['predicted_distance_from_velocity'][1]);
  
          const totalDistanceElement = document.elementFromPoint(item['total_distance'][0],
          window.innerHeight - item['total_distance'][1]);
  
          item['predicted_simple_distance_html_result'] = originalElement && originalElement.innerHTML &&
          predictedSimpleDistanceElement && predictedSimpleDistanceElement.innerHTML &&
          originalElement.innerHTML === predictedSimpleDistanceElement.innerHTML ?
          true : false;
  
          item['predicted_distance_from_velocity_html_result'] = originalElement && originalElement.innerHTML &&
          predictedDistanceFromVelocityElement && predictedDistanceFromVelocityElement.innerHTML &&
          originalElement.innerHTML ===
          predictedDistanceFromVelocityElement.innerHTML ? true : false;
  
          item['total_distance_html_result'] = originalElement && originalElement.innerHTML &&
          totalDistanceElement && totalDistanceElement.innerHTML &&
          originalElement.innerHTML === totalDistanceElement.innerHTML ? true : false;
  
          count1 = item['predicted_simple_distance_html_result'] ? count1 + 1 : count1;
          count2 = item['predicted_distance_from_velocity_html_result'] ? count2 + 1 : count2;
          count3 = item['total_distance_html_result'] ? count3 + 1 : count3;
        }
        return {
            results: this.results,
            percent_simple_distance: count1 / this.results.length,
            percent_distance_from_velocity: count2 / this.results.length,
            percent_total_distance: count3 / this.results.length,
        };
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
        this.action(this.coordinatesWithTime);
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

    action(event: any) {
        if (this.aim === 'template') {
            this.addTemplate(event);
        } else if (this.aim === 'live_prediction') {
            this.predictTemplate(event);
        } else {
            this.addPrediction(event);
        }
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

    addPrediction(event: any) {
        if (event.length) {
            this.addTemplateService.addPrediction(event, 'finalTemplates')
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
