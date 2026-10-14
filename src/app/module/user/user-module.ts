import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing-module';
import { User } from './component/user/user';
import { Header } from '../../shard/header/header';
import { ConfirmDialog } from '../../shard/confirm-dialog';
import { TablePagination } from '../../shard/table-pagination';

@NgModule({
  declarations: [
    User
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    Header,
    ConfirmDialog,
    TablePagination
  ]
})
export class UserModule { }
