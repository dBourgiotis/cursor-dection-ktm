import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

declare let moment: any;
declare let c3: any;

@Component({
  moduleId: module.id,
  selector: 'app-velocity-chart',
  templateUrl: 'velocity-chart.component.html',
})
export class VelocityChartComponent implements OnChanges {
    coordinatesWithTime = [];
    chart: any;
    @Input() array: any;

    ngOnChanges( changes: SimpleChanges) {
        if (changes.array && this.array && this.array.length) {
            this.generateChart(this.formatArrayToChart(this.array));
        }
    }

    formatArrayToChart(template: any) {
        const x = ['x'];
        const t = ['t'];
        const array = [];
        for (const temp of template) {
            x.push(temp.velocity);
            t.push(temp.time);
        }
        array.push(x, t);
        return array;
    }

    generateChart(array: any) {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.chart = c3.generate({
            bindto: '#chart',
            data: {
                xs: {
                    x: 't',
                },
                columns: array,
            },
            axis: {
                x: {
                    label: 'Time'
                },
                y: {
                    label: 'Total Velocity'
                }
            }
        });
    }

}
