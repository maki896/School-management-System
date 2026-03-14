import { Routes } from '@angular/router';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register-page.component').then(
        (module) => module.RegisterPageComponent,
      ),
  },

  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        (module) => module.ADMIN_ROUTES,
      ),
  },
  {
    path: 'teacher',
    canActivate: [roleGuard],
    data: { roles: ['Teacher'] },
    loadChildren: () =>
      import('./features/teacher/teacher.routes').then(
        (module) => module.TEACHER_ROUTES,
      ),
  },
  {
    path: 'student',
    canActivate: [roleGuard],
    data: { roles: ['Student'] },
    loadChildren: () =>
      import('./features/student/student.routes').then(
        (module) => module.STUDENT_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
