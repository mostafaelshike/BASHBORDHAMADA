import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CatogeryRoutingModule } from './catogery-routing-module';
import { Catogery } from './component/catogery/catogery';
import { Header } from '../../shard/header/header';
import { SvgIcon } from '../../shard/svg-icon';
import { ConfirmDialog } from '../../shard/confirm-dialog';
import { TablePagination } from '../../shard/table-pagination';

@NgModule({
  declarations: [
    Catogery
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CatogeryRoutingModule,
    Header,
    SvgIcon,
    ConfirmDialog,
    TablePagination
  ]
})
export class CatogeryModule { }
