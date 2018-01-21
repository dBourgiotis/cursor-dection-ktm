import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HoverableTableComponent } from './hoverable-table/hoverable-table.component';
import { VelocityChartComponent } from './velocity-chart/velocity-chart.component';
import { MakeTemplateComponent } from './make-template/make-template.component';
import { PredictionComponent } from './prediction/prediction.component';

import { AddTemplateService } from './services/add-template.service';
import { PredictService } from './services/predict.service';

@NgModule({
    declarations: [
        AppComponent,
        HoverableTableComponent,
        VelocityChartComponent,
        MakeTemplateComponent,
        PredictionComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
    ],
    providers: [AddTemplateService, PredictService],
    bootstrap: [AppComponent]
})
export class AppModule { }
