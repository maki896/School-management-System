import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <main class="register-page">
      <mat-card appearance="outlined" class="register-card">
        <h2>Create Account</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="name-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="Teacher">Teacher</mat-option>
              <mat-option value="Student">Student</mat-option>
            </mat-select>
          </mat-form-field>

          <p class="status" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            {{ loading() ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Sign In</a>
        </p>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .register-page {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1.25rem;
        background: linear-gradient(160deg, #f6efe4 0%, #fefaf4 55%, #e9f1ee 100%);
      }

      .register-card {
        width: 100%;
        max-width: 450px;
        padding: 2rem;
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
      }

      h2 {
        margin-bottom: 1.5rem;
        text-align: center;
        color: #1f2a1f;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .name-row {
        display: flex;
        gap: 1rem;
      }

      .status {
        color: #a22929;
        margin: 0.5rem 0;
        text-align: center;
      }

      .login-link {
        margin-top: 1.5rem;
        text-align: center;
        color: #506153;
      }

      a {
        color: #8f5f2f;
        text-decoration: none;
        font-weight: 600;
      }

      @media (max-width: 480px) {
        .name-row {
          flex-direction: column;
          gap: 0;
        }
      }
    `,
  ],
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Student' as const, [Validators.required]],
  });

  readonly canSubmit = computed(() => this.form.valid && !this.loading());

  submit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.redirectToHomeForRole();
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to create account.');
      },
    });
  }
}
