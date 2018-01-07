import { Component } from '@angular/core';

declare let moment: any;
declare let c3: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    chartArray: any;

    addTemplate(event: any) {
        const profile = this.overshootingCheck(event);
        this.chartArray = this.transformToVelocityProfile(profile);
    }

    overshootingCheck(template: any) {
      const array = [];
      for (let i = 0 ; i < template.length - 1 ; i++) {
          if (i === 0 ) {
            array.push(template[i]);
          }else {
            // calculate distance of i element from the first element
            const dXi = template[i][0] - template[0][0];
            const dYi = template[i][1] - template[0][1];
            const di = Math.sqrt(Math.pow(dXi, 2) + Math.pow(dYi, 2));

            // calculate distance of i-1 element from the first element OR with the last item pushed to the array
            // const dXi_1 = template[i - 1][0] - template[0][0];
            // const dYi_1 = template[i - 1][1] - template[0][1];
            const dXi_1 = array[array.length - 1][0] - template[0][0];
            const dYi_1 = array[array.length - 1][1] - template[0][1];
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
          const dX = template[i + 1][0] - template[i][0];
          const dY = template[i + 1][1] - template[i][1];
          const dT = template[i + 1][2] - template[i][2];
          const vX = dX / dT;
          const vY = dY / dT;
          const ti = template[i + 1][2];
          const velocity = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2));
          array.push({velocity: velocity.toString(), time: ti});
      }
      return array;
    }

}
