import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Brand } from './component/brand/brand';

const routes: Routes = [
  { path: '', component: Brand }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandRoutingModule { }
