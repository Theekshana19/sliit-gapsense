import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-role-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-role-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthRoleCardComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly link = input.required<string>();
}
