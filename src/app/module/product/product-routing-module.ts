import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Product } from './component/product/product';

const routes: Routes = [
  { path: '', component: Product }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
