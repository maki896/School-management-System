import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  AdminManagementService,
  EnrollmentRecord,
  GradeRecord,
  StudentRecord,
  SubjectRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-enrollment-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <section class="page-grid">
      <mat-card class="form-card">
        <p class="eyebrow">Enrollments</p>
        <h2>Create or archive student placements</h2>
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
              ><mat-option
                *ngFor="let subject of subjects"
                [value]="subject.id"
                >{{ subject.name }}</mat-option
              ></mat-select
            ></mat-form-field
          >
          <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="status success" *ngIf="successMessage">
            {{ successMessage }}
          </p>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit">
              Create enrollment
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="list-card">
        <div class="list-header">
          <div>
            <p class="eyebrow">Relationships</p>
            <h2>{{ enrollments.length }} enrollments</h2>
          </div>
          <button mat-button type="button" (click)="loadAll()">Refresh</button>
        </div>
        <div class="list-empty" *ngIf="enrollments.length === 0">
          No enrollments created yet.
        </div>
        <article class="record" *ngFor="let enrollment of enrollments">
          <div>
            <h3>{{ enrollment.studentName }}</h3>
            <p>{{ enrollment.gradeName }} · {{ enrollment.subjectName }}</p>
            <p>Status: {{ enrollment.status }}</p>
          </div>
          <div class="actions stacked">
            <button
              mat-button
              type="button"
              (click)="archiveEnrollment(enrollment)"
              [disabled]="enrollment.status === 'archived'"
            >
              Archive
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
export class EnrollmentManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  students: StudentRecord[] = [];
  grades: GradeRecord[] = [];
  subjects: SubjectRecord[] = [];
  enrollments: EnrollmentRecord[] = [];
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    studentId: ['', Validators.required],
    gradeId: ['', Validators.required],
    subjectId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.service.loadRelationshipLookups().subscribe({
      next: (response) => {
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

    this.service.listEnrollments().subscribe({
      next: (response) => {
        this.enrollments = response.items;
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
    this.service.createEnrollment(this.form.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Enrollment created.';
        this.errorMessage = '';
        this.form.reset({ studentId: '', gradeId: '', subjectId: '' });
        this.loadAll();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  archiveEnrollment(enrollment: EnrollmentRecord): void {
    this.service.archiveEnrollment(enrollment.id).subscribe({
      next: () => {
        this.successMessage = 'Enrollment archived.';
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
