import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MatModule } from './mat.module';

import { AppComponent } from './app.component';
import { HoverableTableComponent } from './hoverable-table/hoverable-table.component';
import { VelocityChartComponent } from './velocity-chart/velocity-chart.component';
import { MakeTemplateComponent } from './make-template/make-template.component';
import { PredictionComponent } from './prediction/prediction.component';
import { FakeWebsiteComponent } from './fake-website/fake-website.component';
import { AnalysisComponent } from './analysis/analysis.component';

import { AddTemplateService } from './services/add-template.service';
import { PredictService } from './services/predict.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VerifyResultsService } from './services/verify-results.service';
import { AnalysisResultsService } from './services/analysis-results.service';
import { DistChartComponent } from './analysis/dist-chart/dist-chart.component';


@NgModule({
    declarations: [
        AppComponent,
        HoverableTableComponent,
        VelocityChartComponent,
        MakeTemplateComponent,
        PredictionComponent,
        FakeWebsiteComponent,
        AnalysisComponent,
        DistChartComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        MatModule,
        FormsModule,
    ],
    providers: [AddTemplateService, PredictService, VerifyResultsService, AnalysisResultsService],
    bootstrap: [AppComponent]
})
export class AppModule { }
