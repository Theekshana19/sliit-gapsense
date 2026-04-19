import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUiService } from '../services/auth-ui.service';

/**
 * Ensures a valid session: if a token exists but the profile is not loaded yet
 * (e.g. full page refresh), `/api/auth/me` is awaited so downstream pages see `currentUser()`.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthUiService);
  const router = inject(Router);

  if (!auth.hasToken()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url || '/readiness-results' },
    });
  }

  if (!auth.currentUser()) {
    await auth.loadMe();
  }

  if (!auth.currentUser()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url || '/readiness-results' },
    });
  }

  return true;
};

