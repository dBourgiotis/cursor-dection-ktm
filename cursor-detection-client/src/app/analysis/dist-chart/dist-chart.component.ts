import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

declare let moment: any;
declare let c3: any;
declare let d3: any;

@Component({
  moduleId: module.id,
  selector: 'app-dist-chart',
  templateUrl: 'dist-chart.component.html',
})
export class DistChartComponent implements OnChanges {
    chart: any;
    @Input() widget: any;
    @Input() chartFlag: any;

    ngOnChanges( changes: SimpleChanges) {
        if (changes.chartFlag && this.chartFlag) {
            setTimeout( () => {
                this.generateChart();
            }, 200);
        }
    }

    generateChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        const formatedId = '#' + this.widget.id;
        const that = this;
        this.chart = c3.generate({
            bindto: formatedId,
            data: {
                x: 'x',
                columns: that.widget.columns,
                type: 'bar'
            },
            color: {
                pattern: that.widget.color
            },
            axis: {
                x: {
                    label: {
                        text: 'Distance in pixels',
                        position: 'outer-center'
                    },
                    type: 'category',
                },
                y: {
                    label: {
                        text: 'Percent',
                        position: 'outer-center'
                    },
                    tick: {
                        format: d3.format('.2%')
                    }
                }
            },
            legend: {
                hide: true
            }
        });
    }

}
