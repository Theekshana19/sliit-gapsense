import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { AcademicCredentialView } from '../../../models/risk-analysis/academic-credential.model';

@Component({
  selector: 'app-student-academic-credentials',
  standalone: true,
  templateUrl: './student-academic-credentials.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentAcademicCredentialsComponent {
  readonly credentials = input.required<AcademicCredentialView[]>();
}
