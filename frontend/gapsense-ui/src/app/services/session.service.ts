import { Injectable, signal } from '@angular/core';
import { User } from '../models/auth/user.model';

const TOKEN_KEY = 'gapsense_token';
const USER_KEY = 'gapsense_user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userSignal = signal<User | null>(this.readUser());

  user = this.userSignal.asReadonly();

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): User | null {
    return this.userSignal();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
