import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AuthFooterVariant = 'simple' | 'extended';

@Component({
  selector: 'app-auth-footer',
  standalone: true,
  templateUrl: './auth-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFooterComponent {
  readonly variant = input<AuthFooterVariant>('simple');
}
