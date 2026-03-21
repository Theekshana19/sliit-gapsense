import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReadinessWeakTopicsSummary } from '../../../models/risk-analysis/readiness-result.model';

@Component({
  selector: 'app-readiness-weak-topics-card',
  standalone: true,
  templateUrl: './readiness-weak-topics-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessWeakTopicsCardComponent {
  readonly summary = input.required<ReadinessWeakTopicsSummary>();
}
