import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrderRoutingModule } from './order-routing-module';
import { Order } from './component/order/order';
import { Header } from '../../shard/header/header';
import { TablePagination } from '../../shard/table-pagination';

@NgModule({
  declarations: [
    Order
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrderRoutingModule,
    Header,
    TablePagination
  ]
})
export class OrderModule { }
