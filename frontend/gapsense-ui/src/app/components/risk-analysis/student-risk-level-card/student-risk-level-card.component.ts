import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RiskLevelView } from '../../../models/risk-analysis/student-readiness-profile.model';

@Component({
  selector: 'app-student-risk-level-card',
  standalone: true,
  templateUrl: './student-risk-level-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentRiskLevelCardComponent {
  readonly riskLevel = input.required<RiskLevelView>();
}
