import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthRoleCardComponent } from '../auth-role-card/auth-role-card.component';

@Component({
  selector: 'app-signup-role-selector',
  standalone: true,
  imports: [AuthRoleCardComponent],
  templateUrl: './signup-role-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupRoleSelectorComponent {}
