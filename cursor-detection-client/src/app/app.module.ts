import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { HoverableTableComponent } from './hoverable-table/hoverable-table.component';
import { VelocityChartComponent } from './velocity-chart/velocity-chart.component';
import { AddTemplateService } from './services/add-template.service';

@NgModule({
  declarations: [
    AppComponent,
    HoverableTableComponent,
    VelocityChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [AddTemplateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
