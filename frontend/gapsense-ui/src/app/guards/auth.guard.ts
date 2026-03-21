import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const authChildGuard: CanActivateChildFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
