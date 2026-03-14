import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export type RoleName = 'Admin' | 'Teacher' | 'Student';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  status: 'active' | 'inactive';
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

const STORAGE_KEY = 'school-management-auth';

function loadStoredSession(): AuthSession | null {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionState = signal<AuthSession | null>(loadStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly token = computed(() => this.sessionState()?.accessToken ?? null);
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.accessToken));

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthSession>(`${environment.apiBaseUrl}/auth/login`, credentials).pipe(
      tap((session) => this.setSession(session))
    );
  }

  register(payload: any) {
    return this.http.post<AuthSession>(`${environment.apiBaseUrl}/auth/register`, payload).pipe(
      tap((session) => this.setSession(session))
    );
  }


  logout(): void {
    this.sessionState.set(null);
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigate(['/login']);
  }

  hasRole(expectedRoles: RoleName[]): boolean {
    const role = this.role();

    return role ? expectedRoles.includes(role) : false;
  }

  redirectToHomeForRole(): void {
    const role = this.role();
    const target = role === 'Admin' ? '/admin' : role === 'Teacher' ? '/teacher' : '/student';

    void this.router.navigate([target]);
  }

  private setSession(session: AuthSession): void {
    this.sessionState.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}