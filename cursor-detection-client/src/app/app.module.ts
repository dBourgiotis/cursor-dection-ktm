import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HoverableTableComponent } from './hoverable-table/hoverable-table.component';
import { VelocityChartComponent } from './velocity-chart/velocity-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    HoverableTableComponent,
    VelocityChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
