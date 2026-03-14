import { Routes } from '@angular/router';

import { AdminShellComponent } from './admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'teachers',
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/teacher-management/teacher-management.component').then(
            (module) => module.TeacherManagementComponent,
          ),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/student-management/student-management.component').then(
            (module) => module.StudentManagementComponent,
          ),
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./pages/subject-management/subject-management.component').then(
            (module) => module.SubjectManagementComponent,
          ),
      },
      {
        path: 'grades',
        loadComponent: () =>
          import('./pages/grade-management/grade-management.component').then(
            (module) => module.GradeManagementComponent,
          ),
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/enrollment-management/enrollment-management.component').then(
            (module) => module.EnrollmentManagementComponent,
          ),
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./pages/assignment-management/assignment-management.component').then(
            (module) => module.AssignmentManagementComponent,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/attendance-management/attendance-management.component').then(
            (module) => module.AttendanceManagementComponent,
          ),
      },
    ],
  },
];
