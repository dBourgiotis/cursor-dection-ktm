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
    results: any;

    constructor(
      private addTemplateService: AddTemplateService,
      private verifyResultsService: VerifyResultsService,
    ) {}

    verifyResults() {
      this.verifyResultsService.get('results').subscribe(
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
      this.verifyResultsService.post('verifiedResults', verifiedResults).subscribe(
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
