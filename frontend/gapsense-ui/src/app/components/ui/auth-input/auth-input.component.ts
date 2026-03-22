import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthInputComponent {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly inputId = input.required<string>();
  readonly icon = input<string>('');
  readonly autocomplete = input<string>('on');
}
