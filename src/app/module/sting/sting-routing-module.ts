import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Sting } from './component/sting/sting';

const routes: Routes = [
  { path: '', component: Sting }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StingRoutingModule { }
