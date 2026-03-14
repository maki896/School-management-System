import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../../core/auth/auth.service';
import {
  TeacherAssignmentRecord,
  TeacherAttendanceRecord,
  TeacherMarkRecord,
  TeacherPerformanceService,
  TeacherStudentRecord,
} from '../../data/teacher-performance.service';

@Component({
  selector: 'app-performance-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section class="page-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Teacher Workspace</p>
          <h1>Record or update marks and attendance</h1>
          <p class="lede">
            All student choices and subject context stay constrained to the
            authenticated teacher's current assignments.
          </p>
        </div>

        <div class="hero-actions">
          <a mat-stroked-button routerLink="/teacher">Back to dashboard</a>
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
      <p class="status success" *ngIf="successMessage">{{ successMessage }}</p>

      <mat-card class="assignment-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Teaching Scope</p>
            <h2>Assigned contexts</h2>
          </div>
          <button mat-button type="button" (click)="loadData()">Refresh</button>
        </div>

        <div class="assignment-grid">
          <button
            mat-stroked-button
            type="button"
            class="assignment-chip"
            *ngFor="let assignment of assignments"
            (click)="applyAssignment(assignment)"
          >
            {{ assignment.subjectName }} · {{ assignment.gradeName }}
          </button>
        </div>
      </mat-card>

      <section class="forms-grid">
        <mat-card class="panel-card">
          <p class="eyebrow">Marks</p>
          <h2>{{ editingMarkId ? 'Update mark' : 'Record mark' }}</h2>

          <form [formGroup]="markForm" (ngSubmit)="submitMark()">
            <mat-form-field appearance="outline">
              <mat-label>Student</mat-label>
              <mat-select formControlName="studentId">
                <mat-option
                  *ngFor="let student of students"
                  [value]="student.id"
                >
                  {{ student.firstName }} {{ student.lastName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Grade</mat-label>
              <mat-select formControlName="gradeId">
                <mat-option
                  *ngFor="let assignment of assignments"
                  [value]="assignment.gradeId"
                >
                  {{ assignment.gradeName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <mat-select formControlName="subjectId">
                <mat-option
                  *ngFor="let assignment of assignments"
                  [value]="assignment.subjectId"
                >
                  {{ assignment.subjectName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Assessment type</mat-label>
              <input matInput formControlName="assessmentType" />
            </mat-form-field>

            <div class="split-fields">
              <mat-form-field appearance="outline">
                <mat-label>Score</mat-label>
                <input matInput type="number" formControlName="score" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max score</mat-label>
                <input matInput type="number" formControlName="maxScore" />
              </mat-form-field>
            </div>

            <div class="split-fields">
              <mat-form-field appearance="outline">
                <mat-label>Term</mat-label>
                <input matInput formControlName="term" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="draft">Draft</mat-option>
                  <mat-option value="published">Published</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-flat-button color="primary" type="submit">
                {{ editingMarkId ? 'Save mark' : 'Add mark' }}
              </button>
              <button
                mat-button
                type="button"
                *ngIf="editingMarkId"
                (click)="resetMarkForm()"
              >
                Cancel
              </button>
            </div>
          </form>
        </mat-card>

        <mat-card class="panel-card">
          <p class="eyebrow">Attendance</p>
          <h2>
            {{
              editingAttendanceId ? 'Update attendance' : 'Record attendance'
            }}
          </h2>

          <form [formGroup]="attendanceForm" (ngSubmit)="submitAttendance()">
            <mat-form-field appearance="outline">
              <mat-label>Student</mat-label>
              <mat-select formControlName="studentId">
                <mat-option
                  *ngFor="let student of students"
                  [value]="student.id"
                >
                  {{ student.firstName }} {{ student.lastName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Grade</mat-label>
              <mat-select formControlName="gradeId">
                <mat-option
                  *ngFor="let assignment of assignments"
                  [value]="assignment.gradeId"
                >
                  {{ assignment.gradeName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <mat-select formControlName="subjectId">
                <mat-option
                  *ngFor="let assignment of assignments"
                  [value]="assignment.subjectId"
                >
                  {{ assignment.subjectName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="split-fields">
              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="teacherAttendanceDatePicker"
                  formControlName="date"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="teacherAttendanceDatePicker"
                />
                <mat-datepicker #teacherAttendanceDatePicker />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="present">Present</mat-option>
                  <mat-option value="late">Late</mat-option>
                  <mat-option value="absent">Absent</mat-option>
                  <mat-option value="excused">Excused</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" />
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button color="primary" type="submit">
                {{ editingAttendanceId ? 'Save attendance' : 'Add attendance' }}
              </button>
              <button
                mat-button
                type="button"
                *ngIf="editingAttendanceId"
                (click)="resetAttendanceForm()"
              >
                Cancel
              </button>
            </div>
          </form>
        </mat-card>
      </section>

      <section class="lists-grid">
        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Recorded Marks</p>
              <h2>{{ marks.length }} entries</h2>
            </div>
          </div>

          <div class="empty" *ngIf="marks.length === 0">
            No marks recorded yet.
          </div>

          <article class="record" *ngFor="let mark of marks">
            <div>
              <h3>{{ mark.studentName }}</h3>
              <p>
                {{ mark.subjectName }} · {{ mark.gradeName }} · {{ mark.term }}
              </p>
            </div>
            <div class="record-actions">
              <span class="badge">{{ mark.score }}/{{ mark.maxScore }}</span>
              <button mat-button type="button" (click)="editMark(mark)">
                Edit
              </button>
            </div>
          </article>
        </mat-card>

        <mat-card class="panel-card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Recorded Attendance</p>
              <h2>{{ attendance.length }} entries</h2>
            </div>
          </div>

          <div class="empty" *ngIf="attendance.length === 0">
            No attendance recorded yet.
          </div>

          <article class="record" *ngFor="let record of attendance">
            <div>
              <h3>{{ record.studentName }}</h3>
              <p>
                {{ record.subjectName }} · {{ record.gradeName }} ·
                {{ record.date }}
              </p>
            </div>
            <div class="record-actions">
              <span class="badge">{{ record.status }}</span>
              <button mat-button type="button" (click)="editAttendance(record)">
                Edit
              </button>
            </div>
          </article>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell {
        min-height: 100vh;
        display: grid;
        gap: 1rem;
        padding: 1.5rem;
        background:
          radial-gradient(
            circle at top left,
            rgba(199, 179, 145, 0.3),
            transparent 30%
          ),
          linear-gradient(180deg, rgba(23, 58, 70, 0.06), transparent 20%),
          #f6f4ef;
      }

      .hero-card,
      .assignment-card,
      .panel-card {
        padding: 1.25rem;
        border-radius: 1.35rem;
      }

      .hero-card {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        background: #173a46;
        color: #f7f5f0;
      }

      .hero-actions,
      .section-nav,
      .assignment-grid,
      .actions,
      .record-actions {
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
        margin-top: 0.75rem;
        max-width: 40rem;
        color: rgba(247, 245, 240, 0.82);
      }

      .panel-head,
      .record {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .forms-grid,
      .lists-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      form,
      .panel-card {
        display: grid;
        gap: 0.9rem;
      }

      .assignment-card,
      .panel-card {
        background: rgba(255, 255, 255, 0.82);
      }

      .assignment-chip {
        border-radius: 999px;
      }

      .split-fields {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
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

      .status {
        margin: 0;
      }

      .status.error {
        color: #9a2f2f;
      }

      .status.success {
        color: #1d6a3d;
      }

      @media (max-width: 1080px) {
        .forms-grid,
        .lists-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .page-shell {
          padding: 1rem;
        }

        .hero-card,
        .panel-head,
        .record {
          flex-direction: column;
          align-items: flex-start;
        }

        .split-fields {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PerformanceEntryComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly teacherService = inject(TeacherPerformanceService);
  private readonly formBuilder = inject(FormBuilder);

  assignments: TeacherAssignmentRecord[] = [];
  students: TeacherStudentRecord[] = [];
  marks: TeacherMarkRecord[] = [];
  attendance: TeacherAttendanceRecord[] = [];
  editingMarkId: string | null = null;
  editingAttendanceId: string | null = null;
  errorMessage = '';
  successMessage = '';

  readonly markForm = this.formBuilder.nonNullable.group({
    studentId: ['', Validators.required],
    gradeId: ['', Validators.required],
    subjectId: ['', Validators.required],
    assessmentType: ['Midterm', Validators.required],
    score: [75, Validators.required],
    maxScore: [100, Validators.required],
    term: ['Term 1', Validators.required],
    status: ['published' as 'draft' | 'published', Validators.required],
  });

  readonly attendanceForm = this.formBuilder.nonNullable.group({
    studentId: ['', Validators.required],
    gradeId: ['', Validators.required],
    subjectId: ['', Validators.required],
    date: [new Date(), Validators.required],
    status: [
      'present' as 'present' | 'absent' | 'late' | 'excused',
      Validators.required,
    ],
    notes: [''],
  });

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseApiDate(dateValue: string): Date {
    const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      dashboard: this.teacherService.getDashboard(),
      students: this.teacherService.listStudents(),
      marks: this.teacherService.listMarks(),
      attendance: this.teacherService.listAttendance(),
    }).subscribe({
      next: ({ dashboard, students, marks, attendance }) => {
        this.assignments = dashboard.assignments;
        this.students = students.items;
        this.marks = marks.items;
        this.attendance = attendance.items;
        this.errorMessage = '';
        if (this.assignments[0]) {
          this.applyAssignment(this.assignments[0], false);
        }
        if (this.students[0]) {
          this.markForm.patchValue({
            studentId: this.markForm.value.studentId || this.students[0].id,
          });
          this.attendanceForm.patchValue({
            studentId:
              this.attendanceForm.value.studentId || this.students[0].id,
          });
        }
      },
      error: (error) => {
        this.errorMessage = this.teacherService.toErrorMessage(error);
      },
    });
  }

  applyAssignment(
    assignment: TeacherAssignmentRecord,
    clearMessages = true,
  ): void {
    this.markForm.patchValue({
      gradeId: assignment.gradeId,
      subjectId: assignment.subjectId,
    });
    this.attendanceForm.patchValue({
      gradeId: assignment.gradeId,
      subjectId: assignment.subjectId,
    });

    if (clearMessages) {
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  submitMark(): void {
    if (this.markForm.invalid) {
      this.markForm.markAllAsTouched();
      return;
    }

    const value = this.markForm.getRawValue();
    const payload = {
      ...value,
      score: Number(value.score),
      maxScore: Number(value.maxScore),
    };
    const request = this.editingMarkId
      ? this.teacherService.updateMark(this.editingMarkId, payload)
      : this.teacherService.createMark(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingMarkId
          ? 'Mark updated.'
          : 'Mark created.';
        this.errorMessage = '';
        this.resetMarkForm();
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = this.teacherService.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  submitAttendance(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const value = this.attendanceForm.getRawValue();
    const payload = {
      ...value,
      date: this.formatDateForApi(value.date),
    };
    const request = this.editingAttendanceId
      ? this.teacherService.updateAttendance(this.editingAttendanceId, payload)
      : this.teacherService.createAttendance(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingAttendanceId
          ? 'Attendance updated.'
          : 'Attendance created.';
        this.errorMessage = '';
        this.resetAttendanceForm();
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = this.teacherService.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  editMark(mark: TeacherMarkRecord): void {
    this.editingMarkId = mark.id;
    this.markForm.patchValue({
      studentId: mark.studentId,
      gradeId: mark.gradeId,
      subjectId: mark.subjectId,
      assessmentType: mark.assessmentType,
      score: mark.score,
      maxScore: mark.maxScore,
      term: mark.term,
      status: mark.status,
    });
  }

  editAttendance(record: TeacherAttendanceRecord): void {
    this.editingAttendanceId = record.id;
    this.attendanceForm.patchValue({
      studentId: record.studentId,
      gradeId: record.gradeId,
      subjectId: record.subjectId,
      date: this.parseApiDate(record.date),
      status: record.status,
      notes: record.notes ?? '',
    });
  }

  resetMarkForm(): void {
    this.editingMarkId = null;
    this.markForm.reset({
      studentId: this.students[0]?.id ?? '',
      gradeId: this.assignments[0]?.gradeId ?? '',
      subjectId: this.assignments[0]?.subjectId ?? '',
      assessmentType: 'Midterm',
      score: 75,
      maxScore: 100,
      term: 'Term 1',
      status: 'published',
    });
  }

  resetAttendanceForm(): void {
    this.editingAttendanceId = null;
    this.attendanceForm.reset({
      studentId: this.students[0]?.id ?? '',
      gradeId: this.assignments[0]?.gradeId ?? '',
      subjectId: this.assignments[0]?.subjectId ?? '',
      date: new Date(),
      status: 'present',
      notes: '',
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
