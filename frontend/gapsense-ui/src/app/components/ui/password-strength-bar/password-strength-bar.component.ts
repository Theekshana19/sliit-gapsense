import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-password-strength-bar',
  standalone: true,
  templateUrl: './password-strength-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthBarComponent {
  /** Number of filled segments (0–4) */
  readonly segmentsFilled = input.required<number>();
  readonly label = input<string>('SECURITY STRENGTH');
  readonly statusText = input.required<string>();
  readonly hint = input<string>('');
}
