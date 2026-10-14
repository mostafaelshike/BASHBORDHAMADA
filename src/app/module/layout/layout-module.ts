import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { Layout } from './component/layout/layout';
import { NavsideModule } from '../navside/navside-module';
import { Header } from '../../shard/header/header';




@NgModule({
  declarations: [
    Layout
  
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    NavsideModule,
    Header
  ],
   exports:[
    Layout
   ]
})
export class LayoutModule { }
