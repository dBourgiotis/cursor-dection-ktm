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
        this.chartArray = this.transformToVelocityProfile(event);
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
