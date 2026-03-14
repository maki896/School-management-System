import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  AdminManagementService,
  StudentRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <section class="page-grid">
      <mat-card class="form-card">
        <p class="eyebrow">Students</p>
        <h2>{{ editingId ? 'Update student' : 'Create student' }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"
            ><mat-label>First name</mat-label
            ><input matInput formControlName="firstName"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Last name</mat-label
            ><input matInput formControlName="lastName"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Email</mat-label
            ><input matInput type="email" formControlName="email"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Student identifier</mat-label
            ><input matInput formControlName="studentIdentifier"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Password (optional)</mat-label
            ><input matInput type="password" formControlName="password"
          /></mat-form-field>
          <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="status success" *ngIf="successMessage">
            {{ successMessage }}
          </p>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit">
              {{ editingId ? 'Save student' : 'Add student' }}</button
            ><button
              mat-button
              type="button"
              *ngIf="editingId"
              (click)="resetForm()"
            >
              Cancel
            </button>
          </div>
        </form>
      </mat-card>

      <mat-card class="list-card">
        <div class="list-header">
          <div>
            <p class="eyebrow">Directory</p>
            <h2>{{ students.length }} students</h2>
          </div>
          <button mat-button type="button" (click)="loadStudents()">
            Refresh
          </button>
        </div>
        <div class="list-empty" *ngIf="students.length === 0">
          No students created yet.
        </div>

        <article class="record" *ngFor="let student of students">
          <div>
            <h3>{{ student.firstName }} {{ student.lastName }}</h3>
            <p>{{ student.email }}</p>
            <p>
              Status: {{ student.status
              }}<span *ngIf="student.studentIdentifier">
                · {{ student.studentIdentifier }}</span
              >
            </p>
          </div>
          <div class="actions stacked">
            <button
              mat-stroked-button
              type="button"
              (click)="editStudent(student)"
            >
              Edit
            </button>
            <button
              mat-button
              type="button"
              (click)="deactivateStudent(student)"
              [disabled]="student.status === 'inactive'"
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
export class StudentManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  students: StudentRecord[] = [];
  editingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    studentIdentifier: [''],
    password: [''],
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.service.listStudents().subscribe({
      next: (response) => {
        this.students = response.items;
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
    const request = this.editingId
      ? this.service.updateStudent(this.editingId, value)
      : this.service.createStudent(value);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? 'Student updated.'
          : 'Student created.';
        this.errorMessage = '';
        this.resetForm();
        this.loadStudents();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  editStudent(student: StudentRecord): void {
    this.editingId = student.id;
    this.form.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentIdentifier: student.studentIdentifier ?? '',
      password: '',
    });
  }

  deactivateStudent(student: StudentRecord): void {
    this.service.deactivateStudent(student.id).subscribe({
      next: () => {
        this.successMessage = 'Student deactivated.';
        this.errorMessage = '';
        this.loadStudents();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      studentIdentifier: '',
      password: '',
    });
  }
}
