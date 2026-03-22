import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-step-badge',
  standalone: true,
  templateUrl: './auth-step-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthStepBadgeComponent {
  readonly stepText = input.required<string>();
  readonly contextLabel = input<string>('');
}
