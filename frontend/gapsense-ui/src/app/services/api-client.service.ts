import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        httpParams = httpParams.set(k, String(v));
      }
    }
    return this.http.get<T>(url, { params: httpParams });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
