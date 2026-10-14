import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './module/login/login/login';
import { authGuard, guestGuard } from './core/guards/auth.guard';
const routes: Routes = [

  { path: '', component: Login, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadChildren: () => import('./module/layout/layout-module').then(m => m.LayoutModule),
     
  },
  
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
