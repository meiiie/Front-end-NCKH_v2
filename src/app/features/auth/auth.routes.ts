import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: 'Đăng nhập - LMS Maritime'
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    title: 'Đăng ký - LMS Maritime'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
