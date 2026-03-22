import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { WeakTopicFrequencyItem } from '../../../models/risk-analysis/weak-topic-frequency-item.model';
import type { RiskInsight } from '../../../models/risk-analysis/risk-insight.model';
import { RiskInsightCardComponent } from '../risk-insight-card/risk-insight-card.component';

@Component({
  selector: 'app-weak-topic-frequency-card',
  standalone: true,
  imports: [RiskInsightCardComponent],
  templateUrl: './weak-topic-frequency-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicFrequencyCardComponent {
  readonly items = input.required<WeakTopicFrequencyItem[]>();
  readonly selectedPeriod = input<'week' | 'month'>('week');
  readonly insight = input.required<RiskInsight>();

  readonly periodChange = output<'week' | 'month'>();

  protected maxFrequency(): number {
    const list = this.items();
    const maxFromItems = list.length ? Math.max(...list.map((i) => i.frequency)) : 100;
    return Math.max(100, maxFromItems);
  }

  protected barHeightPercent(item: WeakTopicFrequencyItem): number {
    const max = this.maxFrequency();
    return Math.min(100, (item.frequency / max) * 100);
  }
}
