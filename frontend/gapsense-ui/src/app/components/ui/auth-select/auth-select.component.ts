import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { AuthSelectOption } from '../../../models/auth/auth-select-option.model';

@Component({
  selector: 'app-auth-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSelectComponent {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('Select…');
  readonly selectId = input.required<string>();
  readonly options = input.required<readonly AuthSelectOption[]>();
  readonly icon = input<string>('');
}
