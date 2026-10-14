import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { User } from './component/user/user';

const routes: Routes = [
  { path: '', component: User }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
