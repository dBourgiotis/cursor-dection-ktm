import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

declare let moment: any;
declare let c3: any;
declare let d3: any;

@Component({
  moduleId: module.id,
  selector: 'app-scatter-boolean-chart',
  templateUrl: 'scatter-boolean-chart.component.html',
})
export class ScatterBooleanChartComponent implements OnChanges {
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
                xs: {
                    error_distance: 'prediction_result'
                },
                columns: that.widget.columns,
                type: 'scatter'
            },
            color: {
                pattern: that.widget.color
            },
            axis: {
                x: {
                    label: {
                        text: 'Prediction Result',
                        position: 'outer-center'
                    },
                    tick: {
                        fit: false
                    }
                },
                y: {
                    label: {
                        text: 'Error Distance',
                        position: 'outer-center'
                    },
                }
            },
            legend: {
                hide: true
            }
        });
    }
}
