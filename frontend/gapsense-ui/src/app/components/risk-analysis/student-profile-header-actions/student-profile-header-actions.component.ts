import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-student-profile-header-actions',
  standalone: true,
  templateUrl: './student-profile-header-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileHeaderActionsComponent {
  readonly exportPdf = output<void>();
  readonly notifyStudent = output<void>();
}
