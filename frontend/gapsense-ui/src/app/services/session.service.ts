import { Injectable, computed, inject } from '@angular/core';
import type { User } from '../models/auth/user.model';
import { AuthUiService } from './auth-ui.service';

/**
 * Tharindu shell reads the signed-in user from AuthUiService (real API auth).
 * setSession is a no-op; login flows use AuthUiService directly.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authUi = inject(AuthUiService);

  readonly user = computed<User | null>(() => {
    const p = this.authUi.currentUser();
    if (!p) {
      return null;
    }
    return {
      id: p.userId,
      name: p.fullName,
      email: p.email,
      role: p.role,
    };
  });

  getToken(): string | null {
    return this.authUi.getStoredToken();
  }

  getUser(): User | null {
    return this.user();
  }

  isAuthenticated(): boolean {
    return this.authUi.hasToken();
  }

  setSession(_token: string, _user: User): void {
    // No-op: compatibility with Tharindu AuthService mock shape.
  }

  clear(): void {
    this.authUi.logout();
  }
}
