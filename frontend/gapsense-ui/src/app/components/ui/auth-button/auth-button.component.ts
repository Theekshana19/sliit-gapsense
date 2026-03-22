import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  templateUrl: './auth-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthButtonComponent {
  readonly label = input.required<string>();
  readonly type = input<'button' | 'submit'>('submit');
  readonly disabled = input(false);
  readonly variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  readonly showArrow = input(false);

  readonly clicked = output<void>();
}
