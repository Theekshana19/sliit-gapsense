import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { InterventionStrategyView } from '../../../models/risk-analysis/intervention-strategy.model';

@Component({
  selector: 'app-weak-topic-intervention-strategy',
  standalone: true,
  templateUrl: './weak-topic-intervention-strategy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicInterventionStrategyComponent {
  readonly intervention = input.required<InterventionStrategyView>();
  readonly deployRecommendations = output<void>();

  protected iconWrapClass(tone: 'error' | 'secondary'): string {
    return tone === 'error'
      ? 'bg-red-100'
      : 'bg-slate-200';
  }

  protected iconClass(tone: 'error' | 'secondary'): string {
    return tone === 'error' ? 'text-red-800' : 'text-slate-700';
  }
}
