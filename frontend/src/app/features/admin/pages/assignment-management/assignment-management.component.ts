import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  AdminManagementService,
  GradeRecord,
  SubjectRecord,
  TeacherRecord,
  TeachingAssignmentRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-assignment-management',
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
        <p class="eyebrow">Teaching assignments</p>
        <h2>Bind teachers to class and subject contexts</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"
            ><mat-label>Teacher</mat-label
            ><mat-select formControlName="teacherId"
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
              Create assignment
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="list-card">
        <div class="list-header">
          <div>
            <p class="eyebrow">Assignments</p>
            <h2>{{ assignments.length }} assignments</h2>
          </div>
          <button mat-button type="button" (click)="loadAll()">Refresh</button>
        </div>
        <div class="list-empty" *ngIf="assignments.length === 0">
          No teaching assignments created yet.
        </div>
        <article class="record" *ngFor="let assignment of assignments">
          <div>
            <h3>{{ assignment.teacherName }}</h3>
            <p>{{ assignment.gradeName }} · {{ assignment.subjectName }}</p>
            <p>Status: {{ assignment.status }}</p>
          </div>
          <div class="actions stacked">
            <button
              mat-button
              type="button"
              (click)="archiveAssignment(assignment)"
              [disabled]="assignment.status === 'archived'"
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
export class AssignmentManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  teachers: TeacherRecord[] = [];
  grades: GradeRecord[] = [];
  subjects: SubjectRecord[] = [];
  assignments: TeachingAssignmentRecord[] = [];
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    teacherId: ['', Validators.required],
    gradeId: ['', Validators.required],
    subjectId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.service.loadRelationshipLookups().subscribe({
      next: (response) => {
        this.teachers = response.teachers.items.filter(
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

    this.service.listAssignments().subscribe({
      next: (response) => {
        this.assignments = response.items;
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
    this.service.createAssignment(this.form.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Assignment created.';
        this.errorMessage = '';
        this.form.reset({ teacherId: '', gradeId: '', subjectId: '' });
        this.loadAll();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  archiveAssignment(assignment: TeachingAssignmentRecord): void {
    this.service.archiveAssignment(assignment.id).subscribe({
      next: () => {
        this.successMessage = 'Assignment archived.';
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
