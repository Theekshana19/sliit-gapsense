import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReadinessActionPlanSummary } from '../../../models/risk-analysis/readiness-result.model';

@Component({
  selector: 'app-readiness-action-plan-card',
  standalone: true,
  templateUrl: './readiness-action-plan-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessActionPlanCardComponent {
  readonly summary = input.required<ReadinessActionPlanSummary>();
}
