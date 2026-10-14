import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StingRoutingModule } from './sting-routing-module';
import { Sting } from './component/sting/sting';
import { Header } from '../../shard/header/header';

@NgModule({
  declarations: [
    Sting
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StingRoutingModule,
    Header
  ]
})
export class StingModule { }
