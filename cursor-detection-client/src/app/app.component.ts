import { Component } from '@angular/core';

import { AddTemplateService } from './services/add-template.service';
declare let moment: any;
declare let c3: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    chartArray: any = { resampled : null, raw: null, smoothed: null};
    chartFlag = 0;

    constructor(
      private addTemplateService: AddTemplateService,
    ) {}

    addTemplate(event: any) {
        const profile = this.overshootingCheck(event);
        this.addTemplateService.addTemplate(profile)
            .subscribe(
              data => {
                  this.chartArray.resampled = data['resampled'] ? this.transformToVelocityProfile(data['resampled']) : null;
                  this.chartArray.raw = data['raw'] ? this.transformToVelocityProfile(data['raw']) : null;
                  this.chartArray.smoothed = data['smoothed'] ? this.transformToVelocityProfile(data['smoothed']) : null;
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
            // const dXi_1 = template[i - 1][0] - template[0][0];
            // const dYi_1 = template[i - 1][1] - template[0][1];
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
