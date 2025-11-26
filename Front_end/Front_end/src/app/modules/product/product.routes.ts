import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  }
];

