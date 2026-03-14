import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string) {
    return this.http.get<T>(`${environment.apiBaseUrl}${path}`);
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${environment.apiBaseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${environment.apiBaseUrl}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${environment.apiBaseUrl}${path}`);
  }
}