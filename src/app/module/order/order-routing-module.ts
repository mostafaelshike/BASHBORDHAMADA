import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Order } from './component/order/order';

const routes: Routes = [
  { path: '', component: Order }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
