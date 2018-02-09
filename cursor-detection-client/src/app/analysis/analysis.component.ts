import { Component } from '@angular/core';

import { PredictService } from '../services/predict.service';
import { CalculateResultsService } from '../services/calculate-results.service';
import { AnalysisResultsService } from '../services/analysis-results.service';
declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.css'],
    providers: [CalculateResultsService]
})
export class AnalysisComponent {
    chartFlag = 0;
    selected = '90';
    selectedTab = 0;
    results: any = null;
    simpleDistanceErrorPixels: any = [];
    distanceFromVelocityErrorPixels: any = [];
    totalDistanceErrorPixels: any = [];
    simpleDistanceErrorPixelsDist: any;
    distanceFromVelocityErrorPixelsDist: any;
    totalDistanceErrorPixelsDist: any;
    simpleDistanceErrorPixelsDistChart: any = {title: 'Simple Distance',
    color: ['#673ab7'], columns: '', id: 'simpleDistanceErrorPixelsDistChart'} ;
    distanceFromVelocityErrorPixelsDistChart: any = {title: 'Distance From Rest Velocity',
    color: ['#DE0CE8'], columns: '', id: 'distanceFromVelocityErrorPixelsDistChart'} ;
    totalDistanceErrorPixelsDistChart: any = {title: 'Total Distance',
    color: ['#E8510C'], columns: '', id: 'totalDistanceErrorPixelsDistChart'} ;

    constructor(
      private predictService: PredictService,
      private calculateResultsService: CalculateResultsService,
      private analysisResultsService: AnalysisResultsService,
    ) {}

    calculateResults() {
        const experimentType = this.selectedTab ? 'fake_news' : 'table';
        this.calculateResultsService.get(this.selected, experimentType).subscribe(
            data => {
                console.log(data);
            },
            err => console.log(err)
        );
    }

    analysisResults() {
        this.results = null;
        const verifiedResultsCollectionName = this.selectedTab ? 'verifiedFinalResults' : 'verifiedResults';
        this.analysisResultsService.get(verifiedResultsCollectionName).subscribe(
            data => {
                this.results = data;
                this.seperateErrors();
            },
            err => console.log(err)
        );
    }

    seperateErrors() {
        this.simpleDistanceErrorPixels = [];
        this.distanceFromVelocityErrorPixels = [];
        this.totalDistanceErrorPixels = [];
        for ( const item of this.results.results) {
            this.simpleDistanceErrorPixels.push(item.error_distance_of_predicted_simple_distance);
            this.distanceFromVelocityErrorPixels.push(item.error_distance_of_predicted_distance_from_velocity);
            this.totalDistanceErrorPixels.push(item.error_distance_of_predicted_total_distance);
        }
        this.simpleDistanceErrorPixelsDist = this.calculateDists(this.simpleDistanceErrorPixels);
        this.distanceFromVelocityErrorPixelsDist = this.calculateDists(this.distanceFromVelocityErrorPixels);
        this.totalDistanceErrorPixelsDist = this.calculateDists(this.totalDistanceErrorPixels);

        this.simpleDistanceErrorPixelsDistChart.columns = this.formatObjectForChart(this.simpleDistanceErrorPixelsDist);
        this.distanceFromVelocityErrorPixelsDistChart.columns = this.formatObjectForChart(this.distanceFromVelocityErrorPixelsDist);
        this.totalDistanceErrorPixelsDistChart.columns = this.formatObjectForChart(this.totalDistanceErrorPixelsDist);

        this.chartFlag++;
    }

    calculateDists(array: any) {
        const dist = {'0-10': 0, '10-20': 0, '20-30': 0, '30-40': 0, '40-50': 0, '50-60': 0, '60-70': 0,
         '70-80': 0, '80-90': 0, '90-100': 0, '100+': 0 };
        for ( const item of array) {
            if ( item < 10 ) {
                dist['0-10']++;
            } else if ( item < 20 ) {
                dist['10-20']++;
            } else if ( item < 30 ) {
                dist['20-30']++;
            } else if ( item < 40 ) {
                dist['30-40']++;
            } else if ( item < 50 ) {
                dist['40-50']++;
            } else if ( item < 60 ) {
                dist['50-60']++;
            } else if ( item < 70 ) {
                dist['60-70']++;
            } else if ( item < 80 ) {
                dist['70-80']++;
            } else if ( item < 90 ) {
                dist['80-90']++;
            } else if ( item < 100 ) {
                dist['90-100']++;
            } else {
                dist['100+']++;
            }
        }
        dist['0-10'] = dist['0-10'] / array.length ;
        dist['10-20'] = dist['10-20'] / array.length ;
        dist['20-30'] = dist['20-30'] / array.length ;
        dist['30-40'] = dist['30-40'] / array.length ;
        dist['40-50'] = dist['40-50'] / array.length ;
        dist['50-60'] = dist['50-60'] / array.length ;
        dist['60-70'] = dist['60-70'] / array.length ;
        dist['70-80'] = dist['70-80'] / array.length ;
        dist['80-90'] = dist['80-90'] / array.length ;
        dist['90-100'] = dist['90-100'] / array.length ;
        dist['100+'] = dist['100+'] / array.length ;
        return dist;
    }

    formatObjectForChart(object: any) {
        const res =  [['x'], ['distance']];
        for (const key of Object.keys(object)) {
            res[1].push(object[key]);
            res[0].push(key);
        }
        return res;
    }

}
