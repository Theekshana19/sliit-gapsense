import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReassessmentTopicBreakdownItem } from '../../../models/risk-analysis/reassessment-topic-breakdown-item.model';
import type { ReassessmentObservation } from '../../../models/risk-analysis/reassessment-observation.model';
import { ReassessmentObservationCardComponent } from '../reassessment-observation-card/reassessment-observation-card.component';

@Component({
  selector: 'app-reassessment-topic-breakdown-table',
  standalone: true,
  imports: [ReassessmentObservationCardComponent],
  templateUrl: './reassessment-topic-breakdown-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentTopicBreakdownTableComponent {
  readonly items = input.required<ReassessmentTopicBreakdownItem[]>();
  readonly observation = input.required<ReassessmentObservation>();
}
