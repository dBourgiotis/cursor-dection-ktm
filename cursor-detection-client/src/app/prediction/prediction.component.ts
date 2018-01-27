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
    selected: any;

    constructor(
      private predictService: PredictService,
    ) {}

    predictTemplate(event: any) {
        if (this.selected) { this.selected.className = ''; }
        this.predictService.appendCandidate(event, window.innerHeight, window.innerWidth)
            .subscribe(
                data => {
                    console.log(data);
                    const prediction = data['predicted'];
                    this.selected = document.elementFromPoint(prediction[0], window.innerHeight - prediction[1]);
                    this.selected.className = 'selected';
              },
              err => console.log(err)
            );
    }
}
