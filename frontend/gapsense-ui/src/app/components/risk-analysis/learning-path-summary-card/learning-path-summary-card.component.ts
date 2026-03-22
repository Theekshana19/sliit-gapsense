import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { LearningPathSummary } from '../../../models/risk-analysis/learning-path-summary.model';

@Component({
  selector: 'app-learning-path-summary-card',
  standalone: true,
  templateUrl: './learning-path-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathSummaryCardComponent {
  readonly summary = input.required<LearningPathSummary>();
}
