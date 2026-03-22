import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReassessmentImprovementSummary } from '../../../models/risk-analysis/reassessment-improvement-summary.model';

@Component({
  selector: 'app-reassessment-header-delta',
  standalone: true,
  templateUrl: './reassessment-header-delta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentHeaderDeltaComponent {
  readonly summary = input.required<ReassessmentImprovementSummary>();
}
