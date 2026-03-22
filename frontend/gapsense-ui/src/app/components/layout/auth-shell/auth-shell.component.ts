import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthUiService } from '../../../services/auth-ui.service';
import { AuthFooterComponent, AuthFooterVariant } from '../auth-footer/auth-footer.component';
import { AuthHeaderComponent, AuthHeaderLayout } from '../auth-header/auth-header.component';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [AuthHeaderComponent, AuthFooterComponent],
  templateUrl: './auth-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  readonly headerLayout = input<AuthHeaderLayout>('portal');
  readonly stepLabel = input<string>('');
  readonly footerVariant = input<AuthFooterVariant>('simple');

  protected readonly authUi = inject(AuthUiService);

  protected dismissFlash(): void {
    this.authUi.clearFlash();
  }
}
