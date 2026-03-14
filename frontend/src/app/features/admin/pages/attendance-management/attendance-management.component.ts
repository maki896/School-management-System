import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  AdminManagementService,
  AttendanceRecord,
  GradeRecord,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section class="page-grid">
      <mat-card class="form-card">
        <p class="eyebrow">Attendance</p>
        <h2>Record attendance events</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"
            ><mat-label>Student</mat-label
            ><mat-select formControlName="studentId"
              ><mat-option *ngFor="let student of students" [value]="student.id"
                >{{ student.firstName }} {{ student.lastName }}</mat-option
              ></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Teacher</mat-label
            ><mat-select formControlName="teacherId"
              ><mat-option value="">Not set</mat-option
              ><mat-option *ngFor="let teacher of teachers" [value]="teacher.id"
                >{{ teacher.firstName }} {{ teacher.lastName }}</mat-option
              ></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Grade</mat-label
            ><mat-select formControlName="gradeId"
              ><mat-option *ngFor="let grade of grades" [value]="grade.id"
                >{{ grade.name }} · {{ grade.academicYear }}</mat-option
              ></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Subject</mat-label
            ><mat-select formControlName="subjectId"
              ><mat-option value="">General attendance</mat-option
              ><mat-option
                *ngFor="let subject of subjects"
                [value]="subject.id"
                >{{ subject.name }}</mat-option
              ></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Date</mat-label
            ><input
              matInput
              [matDatepicker]="attendanceDatePicker"
              formControlName="date"
            /><mat-datepicker-toggle
              matIconSuffix
              [for]="attendanceDatePicker"
            />
            <mat-datepicker #attendanceDatePicker />
          </mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Status</mat-label
            ><mat-select formControlName="status"
              ><mat-option value="present">Present</mat-option
              ><mat-option value="late">Late</mat-option
              ><mat-option value="absent">Absent</mat-option
              ><mat-option value="excused">Excused</mat-option></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Notes</mat-label
            ><input matInput formControlName="notes"
          /></mat-form-field>
          <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="status success" *ngIf="successMessage">
            {{ successMessage }}
          </p>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit">
              Record attendance
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="list-card">
        <div class="list-header">
          <div>
            <p class="eyebrow">Register</p>
            <h2>{{ attendance.length }} records</h2>
          </div>
          <button mat-button type="button" (click)="loadAll()">Refresh</button>
        </div>
        <div class="list-empty" *ngIf="attendance.length === 0">
          No attendance created yet.
        </div>
        <article class="record" *ngFor="let record of attendance">
          <div>
            <h3>{{ record.studentName }}</h3>
            <p>
              {{ record.gradeName
              }}<span *ngIf="record.subjectName">
                · {{ record.subjectName }}</span
              >
            </p>
            <p>
              {{ record.date }} · {{ record.status
              }}<span *ngIf="record.teacherName">
                · {{ record.teacherName }}</span
              >
            </p>
          </div>
          <div class="actions stacked">
            <button
              mat-button
              type="button"
              (click)="deactivateRecord(record)"
              [disabled]="!record.active"
            >
              Deactivate
            </button>
          </div>
        </article>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .page-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
      }
      .form-card,
      .list-card {
        padding: 1.25rem;
        border-radius: 1.25rem;
      }
      form,
      .list-card {
        display: grid;
        gap: 0.9rem;
      }
      .list-header,
      .record,
      .actions {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }
      .record {
        padding: 1rem 0;
        border-top: 1px solid rgba(31, 42, 31, 0.08);
        align-items: center;
      }
      .record:first-of-type {
        border-top: 0;
      }
      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.74rem;
        color: #8f5f2f;
      }
      .status {
        margin: 0;
      }
      .error {
        color: #9a2f2f;
      }
      .success {
        color: #1d6a3d;
      }
      h2,
      h3,
      p {
        margin: 0;
      }
      .stacked {
        flex-direction: column;
      }
      @media (max-width: 960px) {
        .page-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AttendanceManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  teachers: TeacherRecord[] = [];
  students: StudentRecord[] = [];
  grades: GradeRecord[] = [];
  subjects: SubjectRecord[] = [];
  attendance: AttendanceRecord[] = [];
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    studentId: ['', Validators.required],
    teacherId: [''],
    gradeId: ['', Validators.required],
    subjectId: [''],
    date: [new Date(), Validators.required],
    status: ['present' as AttendanceRecord['status'], Validators.required],
    notes: [''],
  });

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.service.loadRelationshipLookups().subscribe({
      next: (response) => {
        this.teachers = response.teachers.items.filter(
          (item) => item.status === 'active',
        );
        this.students = response.students.items.filter(
          (item) => item.status === 'active',
        );
        this.grades = response.grades.items.filter(
          (item) => item.status === 'active',
        );
        this.subjects = response.subjects.items.filter(
          (item) => item.status === 'active',
        );
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
      },
    });

    this.service.listAttendance().subscribe({
      next: (response) => {
        this.attendance = response.items;
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.service
      .createAttendance({
        ...value,
        date: this.formatDateForApi(value.date),
        subjectId: value.subjectId || undefined,
        teacherId: value.teacherId || undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Attendance recorded.';
          this.errorMessage = '';
          this.form.reset({
            studentId: '',
            teacherId: '',
            gradeId: '',
            subjectId: '',
            date: new Date(),
            status: 'present',
            notes: '',
          });
          this.loadAll();
        },
        error: (error) => {
          this.errorMessage = this.service.toErrorMessage(error);
          this.successMessage = '';
        },
      });
  }

  deactivateRecord(record: AttendanceRecord): void {
    this.service.deactivateAttendance(record.id).subscribe({
      next: () => {
        this.successMessage = 'Attendance record deactivated.';
        this.errorMessage = '';
        this.loadAll();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }
}
