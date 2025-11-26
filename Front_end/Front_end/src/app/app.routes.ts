import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'users',
    loadChildren: () => import('./modules/user/user.routes').then(m => m.userRoutes)
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/product/product.routes').then(m => m.productRoutes)
  },
  {
    path: 'showroom',
    loadComponent: () => import('./modules/showroom/showroom.component').then(m => m.ShowroomComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '',
    loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent)
  }
];
