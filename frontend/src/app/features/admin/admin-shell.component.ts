import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
  ],
  template: `
    <section class="admin-shell">
      <aside class="sidebar">
        <p class="eyebrow">Administrator</p>
        <h1>Academic Control Room</h1>
        <p class="copy">
          Manage school records, staffing context, enrollments, and attendance
          from one protected workspace.
        </p>

        <nav>
          <a routerLink="teachers" routerLinkActive="active">Teachers</a>
          <a routerLink="students" routerLinkActive="active">Students</a>
          <a routerLink="subjects" routerLinkActive="active">Subjects</a>
          <a routerLink="grades" routerLinkActive="active">Grades</a>
          <a routerLink="enrollments" routerLinkActive="active">Enrollments</a>
          <a routerLink="assignments" routerLinkActive="active">Assignments</a>
          <a routerLink="attendance" routerLinkActive="active">Attendance</a>
        </nav>

        <button mat-stroked-button type="button" (click)="logout()">
          Sign out
        </button>
      </aside>

      <main class="content">
        <mat-card appearance="outlined" class="summary-card">
          <div>
            <p class="eyebrow">RBAC</p>
            <h2>Admin-only management surface</h2>
          </div>
          <p>
            All actions here call the protected admin API and inherit
            server-side authorization from the current session.
          </p>
        </mat-card>

        <router-outlet />
      </main>
    </section>
  `,
  styles: [
    `
      .admin-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 18rem minmax(0, 1fr);
        background:
          linear-gradient(180deg, rgba(217, 169, 92, 0.08), transparent 25%),
          #f7f3ea;
      }

      .sidebar {
        display: grid;
        gap: 1rem;
        align-content: start;
        padding: 2rem 1.5rem;
        background: #1d3127;
        color: #f7f3ea;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.75rem;
        color: #d9c18f;
      }

      h1,
      h2 {
        margin: 0;
      }

      .copy {
        margin: 0;
        color: rgba(247, 243, 234, 0.8);
      }

      nav {
        display: grid;
        gap: 0.5rem;
      }

      nav a {
        padding: 0.8rem 0.95rem;
        border-radius: 0.9rem;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.04);
      }

      nav a.active {
        background: #d9a95c;
        color: #1d3127;
        font-weight: 700;
      }

      .content {
        display: grid;
        gap: 1rem;
        padding: 1.5rem;
      }

      .summary-card {
        padding: 1rem 1.25rem;
        border-radius: 1.25rem;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      @media (max-width: 960px) {
        .admin-shell {
          grid-template-columns: 1fr;
        }

        .summary-card {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class AdminShellComponent {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
