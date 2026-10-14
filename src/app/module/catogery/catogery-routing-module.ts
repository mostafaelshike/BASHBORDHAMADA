import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Catogery } from './component/catogery/catogery';

const routes: Routes = [
  { path: '', component: Catogery }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatogeryRoutingModule { }
