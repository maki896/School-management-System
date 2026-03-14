import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../../../core/auth/auth.service';
import { AttendanceTableComponent } from '../../components/attendance-table.component';
import { MarksTableComponent } from '../../components/marks-table.component';
import {
  StudentAttendanceRecord,
  StudentMarkRecord,
  StudentReportResponse,
  StudentReportService,
} from '../../data/student-report.service';

@Component({
  selector: 'app-student-report',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MarksTableComponent,
    AttendanceTableComponent,
  ],
  template: `
    <section class="student-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Student Workspace</p>
          <h1>My academic report</h1>
          <p class="lede">
            Review your own published marks and active attendance only. This
            view is scoped to the signed-in student account.
          </p>
        </div>

        <div class="hero-actions">
          <button mat-stroked-button type="button" (click)="logout()">
            Sign out
          </button>
        </div>
      </header>

      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <section class="summary-grid" *ngIf="report">
        <mat-card appearance="outlined" class="summary-card">
          <p class="eyebrow">Student</p>
          <h2>{{ report.student.firstName }} {{ report.student.lastName }}</h2>
          <p>{{ report.student.email }}</p>
          <p *ngIf="report.student.studentIdentifier">
            ID: {{ report.student.studentIdentifier }}
          </p>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <p class="eyebrow">Current Grade</p>
          <h2>{{ report.grade?.name ?? 'Unavailable' }}</h2>
          <p>
            {{ report.grade?.academicYear ?? 'No active grade context found.' }}
          </p>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <p class="eyebrow">Published Marks</p>
          <h2>{{ marks.length }}</h2>
          <p>Visible results in your own report only.</p>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <p class="eyebrow">Attendance</p>
          <h2>{{ attendance.length }}</h2>
          <p>Active attendance entries for your classes.</p>
        </mat-card>
      </section>

      <section class="report-grid" *ngIf="report">
        <app-marks-table [marks]="marks" />
        <app-attendance-table [attendance]="attendance" />
      </section>
    </section>
  `,
  styles: [
    `
      .student-shell {
        min-height: 100vh;
        display: grid;
        gap: 1rem;
        padding: 1.5rem;
        background:
          radial-gradient(
            circle at top left,
            rgba(215, 181, 116, 0.22),
            transparent 30%
          ),
          linear-gradient(180deg, rgba(36, 58, 74, 0.08), transparent 25%),
          #f7f4ed;
      }

      .hero-card {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 1.35rem;
        background: #243a4a;
        color: #f9f6f0;
      }

      .hero-actions {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.75rem;
        color: #d8be93;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      .lede {
        max-width: 42rem;
        margin-top: 0.75rem;
        color: rgba(249, 246, 240, 0.82);
      }

      .summary-grid,
      .report-grid {
        display: grid;
        gap: 1rem;
      }

      .summary-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .report-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .summary-card {
        padding: 1.25rem;
        border-radius: 1.35rem;
      }

      .status.error {
        margin: 0;
        color: #9a2f2f;
      }

      @media (max-width: 1080px) {
        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .report-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .student-shell {
          padding: 1rem;
        }

        .hero-card {
          flex-direction: column;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StudentReportComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly studentReportService = inject(StudentReportService);

  report: StudentReportResponse | null = null;
  marks: StudentMarkRecord[] = [];
  attendance: StudentAttendanceRecord[] = [];
  errorMessage = '';

  ngOnInit(): void {
    this.studentReportService.getReport().subscribe({
      next: (report) => {
        this.report = report;
        this.marks = report.marks;
        this.attendance = report.attendance;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = this.studentReportService.toErrorMessage(error);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
