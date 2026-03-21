import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TopicPerformanceItem } from '../../../models/risk-analysis/topic-performance.model';

@Component({
  selector: 'app-readiness-topic-performance',
  standalone: true,
  templateUrl: './readiness-topic-performance.component.html',
  host: { class: 'block md:col-span-2' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessTopicPerformanceComponent {
  readonly items = input.required<TopicPerformanceItem[]>();

  protected percentLabelClass(item: TopicPerformanceItem): string {
    return item.barVariant === 'critical' ? 'text-red-600' : 'text-slate-600';
  }

  protected barClass(item: TopicPerformanceItem): string {
    return item.barVariant === 'critical'
      ? 'bg-red-600'
      : 'bg-slate-500';
  }
}
