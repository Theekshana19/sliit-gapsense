import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { WeakTopicSummaryCards } from '../../../models/risk-analysis/weak-topic-analysis.model';

@Component({
  selector: 'app-weak-topic-summary-cards',
  standalone: true,
  templateUrl: './weak-topic-summary-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicSummaryCardsComponent {
  readonly summary = input.required<WeakTopicSummaryCards>();
}
