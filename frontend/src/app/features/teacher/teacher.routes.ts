import { Routes } from '@angular/router';

import { TeacherDashboardComponent } from './pages/dashboard/teacher-dashboard.component';

export const TEACHER_ROUTES: Routes = [
  { path: '', component: TeacherDashboardComponent },
  {
    path: 'performance',
    loadComponent: () =>
      import('./pages/performance/performance-entry.component').then(
        (module) => module.PerformanceEntryComponent,
      ),
  },
];
