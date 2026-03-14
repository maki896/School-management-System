import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  AdminManagementService,
  TeacherRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-teacher-management',
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
        <p class="eyebrow">Teachers</p>
        <h2>{{ editingId ? 'Update teacher' : 'Create teacher' }}</h2>
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
            ><mat-label>Staff identifier</mat-label
            ><input matInput formControlName="staffIdentifier"
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
              {{ editingId ? 'Save teacher' : 'Add teacher' }}
            </button>
            <button
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
            <h2>{{ teachers.length }} teachers</h2>
          </div>
          <button mat-button type="button" (click)="loadTeachers()">
            Refresh
          </button>
        </div>

        <div class="list-empty" *ngIf="teachers.length === 0">
          No teachers created yet.
        </div>

        <article class="record" *ngFor="let teacher of teachers">
          <div>
            <h3>{{ teacher.firstName }} {{ teacher.lastName }}</h3>
            <p>{{ teacher.email }}</p>
            <p>
              Status: {{ teacher.status
              }}<span *ngIf="teacher.staffIdentifier">
                · {{ teacher.staffIdentifier }}</span
              >
            </p>
          </div>
          <div class="actions stacked">
            <button
              mat-stroked-button
              type="button"
              (click)="editTeacher(teacher)"
            >
              Edit
            </button>
            <button
              mat-button
              type="button"
              (click)="deactivateTeacher(teacher)"
              [disabled]="teacher.status === 'inactive'"
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
export class TeacherManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  teachers: TeacherRecord[] = [];
  editingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    staffIdentifier: [''],
    password: [''],
  });

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.service.listTeachers().subscribe({
      next: (response) => {
        this.teachers = response.items;
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
      ? this.service.updateTeacher(this.editingId, value)
      : this.service.createTeacher(value);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? 'Teacher updated.'
          : 'Teacher created.';
        this.errorMessage = '';
        this.resetForm();
        this.loadTeachers();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  editTeacher(teacher: TeacherRecord): void {
    this.editingId = teacher.id;
    this.form.patchValue({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      staffIdentifier: teacher.staffIdentifier ?? '',
      password: '',
    });
  }

  deactivateTeacher(teacher: TeacherRecord): void {
    this.service.deactivateTeacher(teacher.id).subscribe({
      next: () => {
        this.successMessage = 'Teacher deactivated.';
        this.errorMessage = '';
        this.loadTeachers();
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
      staffIdentifier: '',
      password: '',
    });
  }
}
