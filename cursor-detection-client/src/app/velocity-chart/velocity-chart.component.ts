import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

declare let moment: any;
declare let c3: any;
declare let d3: any;

@Component({
  moduleId: module.id,
  selector: 'app-velocity-chart',
  templateUrl: 'velocity-chart.component.html',
})
export class VelocityChartComponent implements OnChanges {
    coordinatesWithTime = [];
    chart: any;
    @Input() array: any;
    @Input() id: any;
    @Input() chartFlag: any;

    ngOnChanges( changes: SimpleChanges) {
        if ((changes.array && this.array && this.array.length)) {
            this.generateChart(this.formatArrayToChart(this.array));
        }else if ( changes.chartFlag && this.array && this.array.length) {
            // setTimeout( res => {
            //     this.generateChart(this.formatArrayToChart(this.array));
            // }, 1000);
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
        const formatedId = '#' + this.id;
        this.chart = c3.generate({
            bindto: formatedId,
            data: {
                xs: {
                    x: 't',
                },
                columns: array,
            },
            axis: {
                x: {
                    label: 'Time',
                    // type: 'timeseries'
                },
                y: {
                    label: 'Velocity',
                    tick: {
                        format: d3.format('.2f')
                    }
                }
            }
        });
    }

}
