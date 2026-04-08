import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { AuthRole } from '../models/auth/auth-role.model';
import { AuthUiService } from '../services/auth-ui.service';

export function roleGuard(allowedRoles: readonly AuthRole[]): CanActivateFn {
  return async (_route, state) => {
    const auth = inject(AuthUiService);
    const router = inject(Router);

    if (!auth.hasToken()) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    let profile = auth.currentUser();
    if (!profile) {
      profile = await auth.loadMe();
    }

    if (!profile) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (allowedRoles.includes(profile.role)) {
      return true;
    }

    return router.createUrlTree([auth.defaultHomeUrlForRole(profile.role)]);
  };
}
