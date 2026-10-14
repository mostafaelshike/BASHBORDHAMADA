import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductRoutingModule } from './product-routing-module';
import { Product } from './component/product/product';
import { Header } from '../../shard/header/header';
import { SvgIcon } from '../../shard/svg-icon';
import { ConfirmDialog } from '../../shard/confirm-dialog';
import { TablePagination } from '../../shard/table-pagination';

@NgModule({
  declarations: [
    Product
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductRoutingModule,
    Header,
    SvgIcon,
    ConfirmDialog,
    TablePagination
  ]
})
export class ProductModule { }
