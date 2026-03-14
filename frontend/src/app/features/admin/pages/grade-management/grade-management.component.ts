import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  AdminManagementService,
  GradeRecord,
} from '../../data/admin-management.service';

@Component({
  selector: 'app-grade-management',
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
        <p class="eyebrow">Grades</p>
        <h2>{{ editingId ? 'Update grade' : 'Create grade' }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"
            ><mat-label>Name</mat-label><input matInput formControlName="name"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>Academic year</mat-label
            ><input matInput formControlName="academicYear"
          /></mat-form-field>
          <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="status success" *ngIf="successMessage">
            {{ successMessage }}
          </p>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit">
              {{ editingId ? 'Save grade' : 'Add grade' }}</button
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
            <p class="eyebrow">Levels</p>
            <h2>{{ grades.length }} grades</h2>
          </div>
          <button mat-button type="button" (click)="loadGrades()">
            Refresh
          </button>
        </div>
        <div class="list-empty" *ngIf="grades.length === 0">
          No grades created yet.
        </div>
        <article class="record" *ngFor="let grade of grades">
          <div>
            <h3>{{ grade.name }}</h3>
            <p>{{ grade.academicYear }}</p>
            <p>Status: {{ grade.status }}</p>
          </div>
          <div class="actions stacked">
            <button mat-stroked-button type="button" (click)="editGrade(grade)">
              Edit</button
            ><button
              mat-button
              type="button"
              (click)="deactivateGrade(grade)"
              [disabled]="grade.status === 'inactive'"
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
export class GradeManagementComponent implements OnInit {
  private readonly service = inject(AdminManagementService);
  private readonly formBuilder = inject(FormBuilder);

  grades: GradeRecord[] = [];
  editingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    academicYear: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadGrades();
  }

  loadGrades(): void {
    this.service.listGrades().subscribe({
      next: (response) => {
        this.grades = response.items;
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
      ? this.service.updateGrade(this.editingId, value)
      : this.service.createGrade(value);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? 'Grade updated.'
          : 'Grade created.';
        this.errorMessage = '';
        this.resetForm();
        this.loadGrades();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  editGrade(grade: GradeRecord): void {
    this.editingId = grade.id;
    this.form.patchValue({
      name: grade.name,
      academicYear: grade.academicYear,
    });
  }

  deactivateGrade(grade: GradeRecord): void {
    this.service.deactivateGrade(grade.id).subscribe({
      next: () => {
        this.successMessage = 'Grade deactivated.';
        this.errorMessage = '';
        this.loadGrades();
      },
      error: (error) => {
        this.errorMessage = this.service.toErrorMessage(error);
        this.successMessage = '';
      },
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ name: '', academicYear: '' });
  }
}
