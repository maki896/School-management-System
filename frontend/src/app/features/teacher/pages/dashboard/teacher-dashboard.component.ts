import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../../../core/auth/auth.service';
import {
  TeacherDashboardResponse,
  TeacherPerformanceService,
} from '../../data/teacher-performance.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatCardModule,
  ],
  template: `
    <section class="teacher-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Teacher Workspace</p>
          <h1>Teacher performance center</h1>
          <p class="lede">
            Review assigned classes, confirm scoped students, and move into mark
            and attendance entry from one protected workspace.
          </p>
        </div>

        <div class="hero-actions">
          <a mat-flat-button color="primary" routerLink="/teacher/performance">
            Open performance workflows
          </a>
          <button mat-stroked-button type="button" (click)="logout()">
            Sign out
          </button>
        </div>
      </header>

      <nav class="section-nav">
        <a
          routerLink="/teacher"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          Dashboard
        </a>
        <a routerLink="/teacher/performance" routerLinkActive="active">
          Performance
        </a>
      </nav>

      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <section class="stats-grid" *ngIf="dashboard">
        <mat-card appearance="outlined">
          <p class="eyebrow">Assignments</p>
          <h2>{{ dashboard.assignments.length }}</h2>
          <p>Active teaching scopes available for this teacher.</p>
        </mat-card>
        <mat-card appearance="outlined">
          <p class="eyebrow">Students</p>
          <h2>{{ dashboard.students.length }}</h2>
          <p>Students available for marks and attendance.</p>
        </mat-card>
        <mat-card appearance="outlined">
          <p class="eyebrow">Recent Marks</p>
          <h2>{{ dashboard.recentMarks.length }}</h2>
          <p>Recently created or updated mark records.</p>
        </mat-card>
        <mat-card appearance="outlined">
          <p class="eyebrow">Recent Attendance</p>
          <h2>{{ dashboard.recentAttendance.length }}</h2>
          <p>Latest attendance events in current scope.</p>
        </mat-card>
      </section>

      <section class="content-grid" *ngIf="dashboard">
        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Assigned Scope</p>
              <h2>Classes you can update</h2>
            </div>
            <a mat-button routerLink="/teacher/performance">Enter marks</a>
          </div>

          <div class="empty" *ngIf="dashboard.assignments.length === 0">
            No active teaching assignments yet.
          </div>

          <article
            class="record"
            *ngFor="let assignment of dashboard.assignments"
          >
            <div>
              <h3>{{ assignment.subjectName }}</h3>
              <p>{{ assignment.gradeName }}</p>
            </div>
            <span class="badge">{{ assignment.status }}</span>
          </article>
        </mat-card>

        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Assigned Students</p>
              <h2>Teacher-scoped roster</h2>
            </div>
          </div>

          <div class="empty" *ngIf="dashboard.students.length === 0">
            No students mapped to current assignments.
          </div>

          <article class="record" *ngFor="let student of dashboard.students">
            <div>
              <h3>{{ student.firstName }} {{ student.lastName }}</h3>
              <p>{{ student.email }}</p>
            </div>
            <span class="badge" *ngIf="student.studentIdentifier">
              {{ student.studentIdentifier }}
            </span>
          </article>
        </mat-card>
      </section>

      <section class="content-grid" *ngIf="dashboard">
        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Recent Marks</p>
              <h2>Latest performance entries</h2>
            </div>
          </div>

          <div class="empty" *ngIf="dashboard.recentMarks.length === 0">
            No marks recorded yet.
          </div>

          <article class="record" *ngFor="let mark of dashboard.recentMarks">
            <div>
              <h3>{{ mark.studentName }}</h3>
              <p>
                {{ mark.subjectName }} · {{ mark.gradeName }} · {{ mark.term }}
              </p>
            </div>
            <span class="badge">{{ mark.score }}/{{ mark.maxScore }}</span>
          </article>
        </mat-card>

        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Recent Attendance</p>
              <h2>Latest class attendance entries</h2>
            </div>
          </div>

          <div class="empty" *ngIf="dashboard.recentAttendance.length === 0">
            No attendance records yet.
          </div>

          <article
            class="record"
            *ngFor="let attendance of dashboard.recentAttendance"
          >
            <div>
              <h3>{{ attendance.studentName }}</h3>
              <p>
                {{ attendance.subjectName }} · {{ attendance.gradeName }} ·
                {{ attendance.date }}
              </p>
            </div>
            <span class="badge">{{ attendance.status }}</span>
          </article>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      .teacher-shell {
        min-height: 100vh;
        display: grid;
        gap: 1rem;
        padding: 1.5rem;
        background:
          radial-gradient(
            circle at top right,
            rgba(51, 110, 107, 0.14),
            transparent 30%
          ),
          linear-gradient(180deg, rgba(203, 176, 138, 0.2), transparent 20%),
          #f6f4ef;
      }

      .hero-card,
      .panel-card,
      .stats-grid mat-card {
        border-radius: 1.35rem;
      }

      .hero-card {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.5rem;
        background: #173a46;
        color: #f7f5f0;
      }

      .hero-actions {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.75rem;
        color: #c7b391;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      .lede {
        max-width: 42rem;
        margin-top: 0.75rem;
        color: rgba(247, 245, 240, 0.82);
      }

      .section-nav {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .section-nav a {
        text-decoration: none;
        color: #173a46;
        padding: 0.75rem 1rem;
        border-radius: 999px;
        background: rgba(23, 58, 70, 0.08);
        font-weight: 600;
      }

      .section-nav a.active {
        background: #173a46;
        color: #f7f5f0;
      }

      .stats-grid,
      .content-grid {
        display: grid;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .stats-grid mat-card,
      .panel-card {
        padding: 1.2rem;
      }

      .content-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .panel-head,
      .record {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .panel-card {
        display: grid;
        gap: 0.9rem;
      }

      .record {
        padding-top: 0.9rem;
        border-top: 1px solid rgba(23, 58, 70, 0.08);
      }

      .record:first-of-type {
        border-top: 0;
        padding-top: 0;
      }

      .badge {
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(23, 58, 70, 0.08);
        color: #173a46;
        font-weight: 700;
      }

      .empty {
        color: #5f6a67;
      }

      .status.error {
        margin: 0;
        color: #9a2f2f;
      }

      @media (max-width: 1100px) {
        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .teacher-shell {
          padding: 1rem;
        }

        .hero-card {
          flex-direction: column;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TeacherDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly teacherService = inject(TeacherPerformanceService);

  dashboard: TeacherDashboardResponse | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.teacherService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (error) => {
        this.errorMessage = this.teacherService.toErrorMessage(error);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
