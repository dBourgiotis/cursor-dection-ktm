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

    constructor(
      private predictService: PredictService,
    ) {}

    predictTemplate(event: any) {
        this.predictService.addTemplate(event)
            .subscribe(
              data => {
                  this.chartArray.predicted = data['predicted'] ? data['predicted'] : null;
                  this.chartArray.original = data['original'] ? data['original'] : null;
                  setTimeout( res => {
                      this.chartFlag ++;
                  }, 1000);
              },
              err => console.log(err)
            );
    }
}
