import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './component/layout/layout';
const routes: Routes = [
  {
    path: '', 
    component: Layout,

     children: [
     { path: '', redirectTo: 'Home', pathMatch: 'full' },
      {
        path: 'Home',
        loadChildren: () => import('../home/home-module').then(m => m.HomeModule)
      },

      {
        path: 'product',
        loadChildren: () => import('../product/product-module').then(m => m.ProductModule)
      },
      {
        path: 'catogery',
        loadChildren: () => import('../catogery/catogery-module').then(m => m.CatogeryModule)
      },

      {
        path: 'brand',
        loadChildren: () => import('../brand/brand-module').then(m => m.BrandModule)
      },

      {
        path: 'order',
        loadChildren: () => import('../order/order-module').then(m => m.OrderModule)
      },
      {
  path: 'user',
  loadChildren: () => import('../user/user-module').then(m => m.UserModule)
},
     
 
      {
        path: 'sting',
        loadChildren: () => import('../sting/sting-module').then(m => m.StingModule)
      },
     
    
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
