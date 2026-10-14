import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrandRoutingModule } from './brand-routing-module';
import { Brand } from './component/brand/brand';
import { Header } from '../../shard/header/header';
import { ConfirmDialog } from '../../shard/confirm-dialog';
import { TablePagination } from '../../shard/table-pagination';

@NgModule({
  declarations: [
    Brand
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrandRoutingModule,
    Header,
    ConfirmDialog,
    TablePagination
  ]
})
export class BrandModule { }
