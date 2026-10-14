import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavsideRoutingModule } from './navside-routing-module';
import { Navside } from './component/navside/navside';
import { RouterModule } from '@angular/router';
import { SvgIcon } from '../../shard/svg-icon';

@NgModule({
  declarations: [
    Navside
  ],
  imports: [
    CommonModule,
    NavsideRoutingModule,
    RouterModule,
    SvgIcon
  ],
  exports:[
    Navside
  ]
})
export class NavsideModule { }
