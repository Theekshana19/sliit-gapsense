import { Injectable, inject } from '@angular/core';
import { AuthUiService } from './auth-ui.service';

/** Tharindu sidebar/top-bar call this for logout; navigation is handled in AuthUiService. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUi = inject(AuthUiService);

  logout(): void {
    this.authUi.logout();
  }
}
