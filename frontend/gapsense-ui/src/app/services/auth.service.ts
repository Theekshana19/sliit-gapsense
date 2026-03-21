import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { LoginRequest } from '../models/auth/login-request.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { User } from '../models/auth/user.model';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = inject(SessionService);

  login(body: LoginRequest): Observable<LoginResponse> {
    if (!body.email?.trim() || !body.password) {
      return throwError(() => new Error('Invalid credentials'));
    }
    const user: User = {
      id: 'u-1',
      name: body.email.split('@')[0] || 'User',
      email: body.email.trim().toLowerCase(),
      role: 'lecturer',
    };
    const token = `mock.${btoa(JSON.stringify({ sub: user.id }))}`;
    return of({ token }).pipe(
      delay(280),
      map((res) => {
        this.session.setSession(res.token, user);
        return res;
      }),
    );
  }

  register(body: RegisterRequest): Observable<User> {
    if (!body.name?.trim() || !body.email?.trim() || body.password.length < 8) {
      return throwError(() => new Error('Invalid registration'));
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      role: 'student',
    };
    return of(user).pipe(
      delay(320),
      map((u) => {
        this.session.setSession(`mock.${btoa(JSON.stringify({ sub: u.id }))}`, u);
        return u;
      }),
    );
  }

  logout(): void {
    this.session.clear();
  }
}
