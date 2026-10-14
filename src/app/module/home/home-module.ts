import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing-module';
import { Home } from './component/home/home/home';
import { Header } from '../../shard/header/header';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TablePagination } from '../../shard/table-pagination';
@NgModule({
  declarations: [
    Home
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    Header,
    NgApexchartsModule,
    TablePagination

  ]
})
export class HomeModule { }
