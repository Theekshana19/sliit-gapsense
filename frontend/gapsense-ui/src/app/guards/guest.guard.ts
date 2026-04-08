import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUiService } from '../services/auth-ui.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthUiService);
  const router = inject(Router);

  if (!auth.hasToken()) {
    return true;
  }

  let profile = auth.currentUser();
  if (!profile) {
    profile = await auth.loadMe();
  }

  if (!profile) {
    return true;
  }

  return router.createUrlTree([auth.defaultHomeUrlForRole(profile.role)]);
};

