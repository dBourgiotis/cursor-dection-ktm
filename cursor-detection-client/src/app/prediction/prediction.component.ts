import { Component } from '@angular/core';

import { PredictService } from '../services/predict.service';
declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-prediction',
    templateUrl: './prediction.component.html',
    styleUrls: ['./prediction.component.css']
})
export class PredictionComponent {
    chartArray: any = { resampled : null, raw: null, smoothed: null};
    chartFlag = 0;
    selected2: any;
    selected1: any;

    constructor(
      private predictService: PredictService,
    ) {}

    predictTemplate(event: any) {
        if (this.selected1) { this.selected1.className = ''; }
        if (this.selected2) { this.selected2.className = ''; }
        this.predictService.appendCandidate(event, window.innerHeight, window.innerWidth, 'templates')
            .subscribe(
                data => {
                    console.log(data);
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
