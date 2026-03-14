import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,

    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <main class="login-page">
      <section class="login-copy">
        <h1 class="eyebrow">School Management System</h1>
        <p>Role-based academic workflows with one source of truth.</p>
        <p class="lede">
          Sign in as Admin, Teacher, or Student to verify server-authoritative
          access and the current implementation foundation.
        </p>
      </section>

      <mat-card appearance="outlined" class="login-card">
        <h2>Sign In</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              autocomplete="username"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input
              matInput
              type="password"
              formControlName="password"
              autocomplete="current-password"
            />
          </mat-form-field>

          <p class="status" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            {{ loading() ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <p class="register-link">
          Don't have an account? <a routerLink="/register">Register</a>
        </p>


        <div class="seed-notes">
          <p>Expected seed accounts:</p>
          <ul>
            <li>admin&#64;school.local</li>
            <li>teacher&#64;school.local</li>
            <li>student&#64;school.local</li>
          </ul>
        </div>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 2rem;
        padding: 3rem;
        background:
          radial-gradient(
            circle at top left,
            rgba(232, 163, 75, 0.22),
            transparent 30%
          ),
          linear-gradient(160deg, #f6efe4 0%, #fefaf4 55%, #e9f1ee 100%);
      }

      .login-copy,
      .login-card {
        align-self: center;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #8f5f2f;
        font-weight: 700;
      }

      h1 {
        font-size: clamp(2.4rem, 5vw, 4.5rem);
        line-height: 0.95;
        margin: 0 0 1rem;
        color: #1f2a1f;
      }

      .lede {
        max-width: 40rem;
        color: #415044;
        font-size: 1.05rem;
      }

      .login-card {
        padding: 1.75rem;
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
      }

      form {
        display: grid;
        gap: 1rem;
      }

      .status {
        color: #a22929;
        margin: 0;
      }

      .register-link {
        margin-top: 1rem;
        text-align: center;
        color: #506153;
      }

      .register-link a {
        color: #8f5f2f;
        text-decoration: none;
        font-weight: 600;
      }

      .seed-notes {

        margin-top: 1rem;
        color: #506153;
        font-size: 0.95rem;
      }

      ul {
        padding-left: 1.25rem;
        margin: 0.5rem 0 0;
      }

      @media (max-width: 960px) {
        .login-page {
          grid-template-columns: 1fr;
          padding: 1.25rem;
        }
      }
    `,
  ],
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@school.local', [Validators.required, Validators.email]],
    password: ['Password123!', [Validators.required]],
  });
  readonly canSubmit = computed(() => this.form.valid && !this.loading());

  submit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.redirectToHomeForRole();
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to sign in.');
      },
    });
  }
}
