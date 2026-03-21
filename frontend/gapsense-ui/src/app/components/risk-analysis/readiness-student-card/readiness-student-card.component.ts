import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StudentReadinessSummary } from '../../../models/risk-analysis/student-readiness-summary.model';

@Component({
  selector: 'app-readiness-student-card',
  standalone: true,
  templateUrl: './readiness-student-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessStudentCardComponent {
  readonly summary = input.required<StudentReadinessSummary>();
}
