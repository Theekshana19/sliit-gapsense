import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type AuthHeaderLayout = 'login' | 'signup-landing' | 'portal' | 'slim';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthHeaderComponent {
  readonly layout = input<AuthHeaderLayout>('portal');
  readonly stepLabel = input<string>('');
}
