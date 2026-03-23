import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUiService } from '../services/auth-ui.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthUiService);
  const router = inject(Router);

  if (!auth.hasToken()) {
    return true;
  }

  return router.createUrlTree(['/risk-thresholds']);
};

