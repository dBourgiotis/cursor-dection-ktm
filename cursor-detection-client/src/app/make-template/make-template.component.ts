import { Component } from '@angular/core';

import { AddTemplateService } from '../services/add-template.service';
import { VerifyResultsService } from '../services/verify-results.service';
declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-make-template',
    templateUrl: './make-template.component.html',
    styleUrls: ['./make-template.component.css']
})
export class MakeTemplateComponent {
    chartArray: any = { resampled : null, raw: null, smoothed: null};
    chartFlag = 0;
    aim = 'template';
    constructor(
      private addTemplateService: AddTemplateService,
      private verifyResultsService: VerifyResultsService,
    ) {}

    verifyResults() {
      this.verifyResultsService.get('results').subscribe(
        data => console.log(data),
        err => console.log(err)
      );
    }

    action(event: any) {
        if (this.aim === 'template') {
          this.addTemplate(event);
        } else {
          this.addPrediction(event);
        }
    }

    addPrediction(event: any) {
      this.addTemplateService.addPrediction(event, 'templates')
            .subscribe(
              data => {
                console.log('added');
              },
              err => console.log(err)
            );
    }

    addTemplate(event: any) {
        this.addTemplateService.addTemplate(event, 'templates')
            .subscribe(
              data => {
                  this.chartArray.resampled = data['resampled'] ? data['resampled'] : null;
                  this.chartArray.smoothed = data['smoothed'] ? data['smoothed'] : null;
                  setTimeout( res => {
                      this.chartFlag ++;
                  }, 1000);
              },
              err => console.log(err)
            );
    }

    overshootingCheck(template: any) {
      const array = [];
      for (let i = 0 ; i < template.length - 1 ; i++) {
          if (i === 0 ) {
            array.push(template[i]);
          }else {
            // calculate distance of i element from the first element
            const dXi = template[i]['x'] - template[0]['x'];
            const dYi = template[i]['y'] - template[0]['y'];
            const di = Math.sqrt(Math.pow(dXi, 2) + Math.pow(dYi, 2));

            // calculate distance of i-1 element from the first element OR with the last item pushed to the array
            const dXi_1 = array[array.length - 1]['x'] - template[0]['x'];
            const dYi_1 = array[array.length - 1]['y'] - template[0]['y'];
            const di_1 = Math.sqrt(Math.pow(dXi_1, 2) + Math.pow(dYi_1, 2));
            if (di > di_1) {
              array.push(template[i]);
            }
          }
      }
      return array;
    }

    transformToVelocityProfile(template: any) {
      const array = [];
      for (let i = 0 ; i < template.length - 1 ; i++) {
          const dX = template[i + 1]['x'] - template[i]['x'];
          const dY = template[i + 1]['y'] - template[i]['y'];
          const dT = template[i + 1]['t'] - template[i]['t'];
          const vX = dX / dT;
          const vY = dY / dT;
          const ti = template[i + 1]['t'];
          const velocity = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2));
          array.push({velocity: velocity.toString(), time: ti});
      }
      return array;
    }

}
