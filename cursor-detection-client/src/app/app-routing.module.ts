import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MakeTemplateComponent } from './make-template/make-template.component';
import { PredictionComponent } from './prediction/prediction.component';
import { FakeWebsiteComponent } from './fake-website/fake-website.component';

const routes: Routes = [
  { path: '', component: MakeTemplateComponent },
  { path: 'prediction', component: PredictionComponent },
  { path: 'fake-website', component: FakeWebsiteComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
