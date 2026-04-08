import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-password-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-password-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPasswordInputComponent {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('••••••••');
  readonly inputId = input.required<string>();
  readonly icon = input<string>('lock');
  readonly autocomplete = input<string>('new-password');

  protected readonly visible = signal(false);

  protected toggle(): void {
    this.visible.update((v) => !v);
  }
}
